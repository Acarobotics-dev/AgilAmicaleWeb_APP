const House = require("../../models/House");
const Booking = require("../../models/booking");
const User = require("../../models/User");
const path = require("path");
const { safeDeleteFile, safeDeleteFiles, normalizeFilePath } = require("../../helpers/fileUtils");
const { sendEmail } = require("../../helpers/mailer");

// Custom ValidationError class
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

const addNewHouse = async (req, res, next) => {
  try {

  const houseData = req.body;

    // --- 1. Parse JSON fields if they're strings ---
    const parseIfString = (field) => {
      if (typeof houseData[field] === "string") {
        try {
          houseData[field] = JSON.parse(houseData[field]);
        } catch (err) {
          throw new Error(`Field '${field}' must be a valid JSON array.`);
        }
      }
    };

    // Do NOT accept availablePeriod from client; derive it from the price weeks.
    ["price", "amenities", "unavailableDates"].forEach(parseIfString);

    // --- 2. Process price array (normalize week dates and derive availablePeriod) ---
    if (Array.isArray(houseData.price)) {
      const parseDate = (v) => (v ? new Date(v) : null);
      houseData.price = houseData.price.map((item) => {
        const week = item.week || {};
        const start = parseDate(week.startdate || week.startDate || week.start);
        const end = parseDate(week.endDate || week.enddate || week.end);
        return {
          week: { startdate: start, endDate: end },
          price: item.price,
        };
      });

      // Derive availablePeriod as [earliest start, latest end]
      const starts = houseData.price
        .map((p) => p.week?.startdate)
        .filter(Boolean)
        .map((d) => d.getTime());
      const ends = houseData.price
        .map((p) => p.week?.endDate)
        .filter(Boolean)
        .map((d) => d.getTime());

      if (starts.length > 0 && ends.length > 0) {
        const minStart = new Date(Math.min(...starts));
        const maxEnd = new Date(Math.max(...ends));
        houseData.availablePeriod = [minStart, maxEnd];
      } else if (houseData.price.length > 0) {
        // Price array exists but has no valid dates
        throw new Error("Price entries must include valid start and end dates for each week.");
      }
    }

    // --- 3. Normalize unavailableDates to YYYY-MM-DD string format ---
    const normalizeToDateStrings = (field) => {
      if (Array.isArray(houseData[field])) {
        houseData[field] = houseData[field].map((dateValue) => {
          // If it's already a string in YYYY-MM-DD format, keep it
          if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
          }
          // Otherwise convert to Date and extract YYYY-MM-DD
          const date = new Date(dateValue);
          return date.toISOString().split('T')[0];
        });
      }
    };
    normalizeToDateStrings("unavailableDates");

    // --- 4. Handle uploaded images ---
    if (req.uploadedImages?.length > 0) {
      houseData.images = req.uploadedImages.map((img) =>
        normalizeFilePath(path.join("uploads", "gallery", img.filename))
      );
    }

    // --- 5. Create and save the new house ---
    const newHouse = new House(houseData);
    const savedHouse = await newHouse.save();
    console.log('✅ [Houses] House created successfully, ID:', savedHouse._id);

    // Send email notifications to approved users (fire-and-forget)
    console.log('✉️ [Houses] Queuing email notifications...');
    setImmediate(async () => {
      try {
        console.log('✉️ [Houses] Starting email notification process...');

        const approvedUsers = await User.find({
          status: 'Approuvé',
          userEmail: { $exists: true, $ne: '' }
        }).select('userEmail firstName lastName').lean();

        console.log(`✉️ [Houses] Found ${approvedUsers.length} approved users with emails`);

        const emails = approvedUsers.map(u => ({
          to: u.userEmail,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim()
        })).filter(e => e.to);

        if (emails.length === 0) {
          console.log('✉️ [Houses] No valid emails to send to');
          return;
        }

            const { houseCreatedTemplate } = require("../../helpers/emailTemplates");
            const tmpl = houseCreatedTemplate(savedHouse);
            const subject = tmpl.subject;
            const text = tmpl.text;
            const html = tmpl.html;

        // Send emails in batches to avoid overwhelming the mail server
        const concurrency = 10;
        let sent = 0;
        let failed = 0;

        for (let i = 0; i < emails.length; i += concurrency) {
          const batch = emails.slice(i, i + concurrency);
          const promises = batch.map(e => sendEmail({ to: e.to, subject, text, html }));
          const results = await Promise.allSettled(promises);
          results.forEach(r => {
            if (r.status === 'fulfilled' && r.value && r.value.success) sent++; else failed++;
          });
          console.log(`✉️ [Houses] Batch processed: sent ${sent}, failed ${failed}`);
        }

        console.log(`✉️ [Houses] Email notifications completed: sent ${sent}/${emails.length}, failed ${failed}`);
      } catch (emailErr) {
        console.error('❌ [Houses] Email notification failed:', emailErr.message, emailErr.stack);
      }
    });

    return res.status(201).json({
      success: true,
      message: "House created successfully",
      data: savedHouse,
    });

  } catch (error) {
    console.error("House creation error:", error);

    // --- Cleanup uploaded files if error occurred ---
    if (req.uploadedImages?.length > 0) {
      cleanupUploadedFiles(req.uploadedImages).catch(console.error);
    }

    // Pass error to global error handler
    next(error);
  }
};

const getAllHouses = async (req, res, next) => {
  try {
    const housesList = await House.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: housesList,
    });
  } catch (err) {
    next(err);
  }
};

const getHouseDetailsByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const house = await House.findById(id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: house,
    });
  } catch (err) {
    next(err);
  }
};
/////Update//////////////////
const updateHouseByID = async (req, res, next) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({
    success: false,
    message: "Missing house ID"
  });

  let house;
  let newImagePaths = [];

  try {
    // Find house and validate existence
    house = await House.findById(id);
    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found.",
      });
    }

    const oldImages = [...house.images];

    // Parse removedImageUrls from request body
    let removedImageUrls = [];
    try {
      if (req.body.removedImageUrls) {
        removedImageUrls = JSON.parse(req.body.removedImageUrls);
      }
    } catch (parseError) {
      console.error("Error parsing removedImageUrls:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid format for removedImageUrls",
      });
    }

    // Normalize removedImageUrls to filenames (basename) so callers can send either full paths or filenames
    const removedFilenames = removedImageUrls.map(item => path.basename(String(item)));

    // Process new uploads
    if (req.uploadedImages?.length > 0) {
      // Process new images using normalizeFilePath for consistency
      newImagePaths = req.uploadedImages.map(img =>
        normalizeFilePath(path.join('uploads', 'gallery', img.filename))
      );
    }

    // Determine which existing images (full stored paths) match the filenames to remove
    const imagesToDelete = oldImages.filter(img => removedFilenames.includes(path.basename(img)));
    // keptImages = images that are not removed
    const keptImages = oldImages.filter(img => !removedFilenames.includes(path.basename(img)));

    // Check duplicates inside keptImages (user's kept selection)
    const duplicateKeptEntries = keptImages.filter((v, i, a) => a.indexOf(v) !== i);
    const duplicatesInKept = [...new Set(duplicateKeptEntries)];
    if (duplicatesInKept.length > 0) {
      console.warn('UpdateHouseByID - duplicates found in keptImages:', duplicatesInKept);
    }

    // Combine kept existing images with newly uploaded ones, then deduplicate preserving order
    const rawFinalImages = [...keptImages, ...newImagePaths];
    const duplicateEntries = rawFinalImages.filter((v, i, a) => a.indexOf(v) !== i);
    const duplicates = [...new Set(duplicateEntries)];
    const finalImages = rawFinalImages.filter((v, i, a) => a.indexOf(v) === i);

    // Update house data
    const updates = parseUpdates(req.body);

    // Validate updates if needed
    if (typeof validateSpecialFields === 'function') {
      validateSpecialFields(updates);
    }

    let hasChanges = false;

    // Check if we have updates or image changes
    if (Object.keys(updates).length > 0 ||
        finalImages.length !== oldImages.length ||
        JSON.stringify(finalImages) !== JSON.stringify(oldImages)) {

      Object.assign(house, updates);
      house.images = finalImages;
      hasChanges = true;
    }

    // Save changes if any
    let updatedHouse = house;
    if (hasChanges) {
      updatedHouse = await house.save();

      // Notify approved users by email about the update (fire-and-forget)
      try {
        const { sendEmail } = require("../../helpers/mailer");
        console.log('✉️ [Houses] Queuing update notification emails...');
        setImmediate(async () => {
          try {
            const approvedUsers = await User.find({ status: 'Approuvé', userEmail: { $exists: true, $ne: '' } }).select('userEmail firstName').lean();
            const recipients = approvedUsers.map(u => ({ to: u.userEmail, name: u.firstName || '' })).filter(r => r.to);
            if (recipients.length === 0) return;

            const { houseUpdatedTemplate } = require("../../helpers/emailTemplates");
            const tmpl = houseUpdatedTemplate(updatedHouse);
            const subject = tmpl.subject;
            const text = tmpl.text;
            const html = tmpl.html;

            const concurrency = 10;
            let sent = 0;
            let failed = 0;
            for (let i = 0; i < recipients.length; i += concurrency) {
              const batch = recipients.slice(i, i + concurrency);
              const results = await Promise.allSettled(batch.map(r => sendEmail({ to: r.to, subject, text, html })));
              results.forEach(r => {
                if (r.status === 'fulfilled' && r.value && r.value.success) sent++; else failed++;
              });
            }
            console.log(`✉️ [Houses] Update notification emails queued: sent ${sent}/${recipients.length}, failed ${failed}`);
          } catch (e) {
            console.error('❌ [Houses] Failed to queue update notification emails:', e.message);
          }
        });
      } catch (e) {
        console.error('❌ [Houses] Error scheduling update emails:', e.message);
      }
    }

    // Async cleanup of removed images (AFTER successful save)
    if (imagesToDelete.length > 0) {
      cleanupImages(imagesToDelete)
        .catch(err => console.error('Image cleanup error:', err));
    }

    return res.status(200).json({
      success: true,
      message: hasChanges
        ? "House updated successfully."
        : "No changes detected.",
      data: updatedHouse,
      changesMade: hasChanges,
      keptImages,
      duplicatesInKept,
      duplicates
    });

  } catch (error) {
    console.error("Error updating house:", error);

    // Cleanup on error
    if (newImagePaths.length > 0) {
      cleanupImages(newImagePaths).catch(console.error);
    } else if (req.uploadedImages?.length > 0) {
      cleanupUploadedFiles(req.uploadedImages).catch(console.error);
    }

    // Delegate to global error handler
    next(error);
  }
};
// --- Helper Functions ---

const parseUpdates = (body) => {
  const updates = { ...body };
  const parseIfString = (value) => {
    if (typeof value !== 'string') return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  // Parse fields that might be stringified JSON
  const parseableFields = ['availablePeriod', 'unavailableDates', 'amenities', 'price'];
  parseableFields.forEach(field => {
    if (field in updates) {
      updates[field] = parseIfString(updates[field]);
    }
  });

  // Normalize unavailableDates to YYYY-MM-DD string format
  if ('unavailableDates' in updates && Array.isArray(updates.unavailableDates)) {
    updates.unavailableDates = updates.unavailableDates.map((dateValue) => {
      // If it's already a string in YYYY-MM-DD format, keep it
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return dateValue;
      }
      // Otherwise convert to Date and extract YYYY-MM-DD
      const date = new Date(dateValue);
      return date.toISOString().split('T')[0];
    });
  }

  return updates;
};

const validateSpecialFields = (updates) => {
  // Validate amenities
  if ('amenities' in updates && !Array.isArray(updates.amenities)) {
    throw new ValidationError('Le champ "amenities" doit être un tableau');
  }

  // Validate price
  if ('price' in updates && !Array.isArray(updates.price)) {
    throw new ValidationError('Le champ "price" doit être un tableau');
  }

  // Validate array fields
  const arrayFields = ['availablePeriod', 'unavailableDates'];
  arrayFields.forEach(field => {
    if (field in updates && !Array.isArray(updates[field])) {
      throw new ValidationError(`Le champ "${field}" doit être un tableau`);
    }
  });
};



const cleanupImages = async (imagePaths) => {
  try {
    await Promise.all(imagePaths.map(safeDeleteFile));
  } catch (err) {
    console.error('Image cleanup failed:', err);
    throw err;
  }
};

const cleanupUploadedFiles = async (uploadedFiles) => {
  try {
    const filePaths = uploadedFiles.map(file => file.path);
    await safeDeleteFiles(filePaths);
  } catch (err) {
    console.error('Error cleaning up uploaded files:', err);
    throw err;
  }
};



const DeleteHouseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const house = await House.findById(id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found.",
      });
    }

    if (house.images?.length > 0) {
      await Promise.all(house.images.map(safeDeleteFile));
    }

    await Booking.deleteMany({ activity: id, activityModel: "House" });
    const deletedHouse = await House.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "House and related bookings deleted successfully.",
      data: deletedHouse,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addNewHouse,
  getAllHouses,
  getHouseDetailsByID,
  updateHouseByID,
  DeleteHouseById,
};
