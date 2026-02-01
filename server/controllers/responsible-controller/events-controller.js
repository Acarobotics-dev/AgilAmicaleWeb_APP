const Event = require("../../models/Events");
const Booking = require("../../models/booking");
const User = require("../../models/User");
const path = require("path");
const { UPLOADS_ROOT, safeDeleteFile, safeDeleteFiles, safeDeleteFileSync, normalizeFilePath } = require("../../helpers/fileUtils");
const { sendBulkSMS } = require("../../helpers/smsService");

// Helper to cleanup multiple images
const cleanupImages = async (imagePaths) => {
  try {
    await safeDeleteFiles(imagePaths);
  } catch (err) {
    console.error('Image cleanup failed:', err);
    throw err;
  }
};

// Helper function to validate event input (minimal)
const validateEventInput = (body) => {
  const errors = [];
  if (!body.title || body.title.trim() === "") {
    errors.push("Title is required");
  }
  if (
    !body.type ||
    !["Voyage", "Excursion", "Club", "Évènement", "Activité"].includes(body.type)
  ) {
    errors.push("Valid type is required");
  }
  if (!body.description || body.description.trim() === "") {
    errors.push("Description is required");
  }
  return errors.length > 0 ? errors : null;
};

// Create a new event (handles all types)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      type,
      description,
      images,
      pricing,
      includes,
      maxParticipants,
      currentParticipants,
      isActive,
      isFeatured,
      // Voyage
      startDate,
      endDate,
      destination,
      departureCity,
      transportType,
      accommodation,
      // Excursion
      date, // <-- will be ignored
      durationHours,
      meetingPoint,
      meetingTime,
      equipmentRequired,
      guideIncluded,
      // Club
      adresseclub,
      recurringDays,
      schedule,
      categoryclub,
      ageGroup,
      // Activité
      activityDate, // <-- will be ignored
      sportType,
      durationMinutes,
      location,
      equipmentProvided,
      // Évènement
      eventDate, // <-- will be ignored
      eventTime,
      organizer,
      program,
    } = req.body;

    // Validate input
    const validationErrors = validateEventInput(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(", "),
      });
    }

    // Ensure startDate and endDate are present for all event types
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required for events',
      });
    }

    // Parse pricing if sent as string
    let parsedPricing = pricing;
    if (typeof pricing === "string") {
      try {
        parsedPricing = JSON.parse(pricing);
      } catch {
        parsedPricing = {};
      }
    } else if (!parsedPricing && typeof req.body.pricing === "string") {
      try {
        parsedPricing = JSON.parse(req.body.pricing);
      } catch {
        parsedPricing = {};
      }
    }

    // Normalize booleans and numbers
    const parsedIsActive =
      isActive === true || isActive === "true" || isActive === "1" ? true : false;
    const parsedIsFeatured =
      isFeatured === true || isFeatured === "true" || isFeatured === "1" ? true : false;

    const parsedMaxParticipants =
      typeof maxParticipants === "string" && maxParticipants.trim() !== ""
        ? Number(maxParticipants)
        : maxParticipants;

    // Handle images
    let eventPhotos = [];
    if (req.files && req.files.length > 0) {
      // Store paths as uploads/... relative to server root for consistency with other controllers
      eventPhotos = req.files.map((file) => {
        const relativePath = path.relative(UPLOADS_ROOT, file.path);
        // Prepend 'uploads/' to match the format expected by safeDeleteFile
        return normalizeFilePath(path.join('uploads', relativePath));
      });
    } else if (Array.isArray(images)) {
      eventPhotos = images;
    }

    // Parse arrays if sent as JSON strings
    const parseArray = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [val];
        }
      }
      return Array.isArray(val) ? val : [];
    };

    // Prepare base event data
    let eventData = {
      title,
      type,
      description,
      images: eventPhotos,
      featuredPhoto: eventPhotos[0] || null,
      numberOfCompanions: req.body.numberOfCompanions || 0,
      numberOfChildren: req.body.numberOfChildren || 0,
      pricing: parsedPricing?.basePrice || req.body.basePrice || req.body.pricing,
      cojoinPresence: req.body.cojoinPresence === true || req.body.cojoinPresence === "true",
      cojoinPrice: req.body.cojoinPrice || parsedPricing?.cojoinPrice,
      childPresence: req.body.childPresence === true || req.body.childPresence === "true",
      childPrice: req.body.childPrice || parsedPricing?.childPrice,
      includes: parseArray(includes || req.body.includes),
      maxParticipants: parsedMaxParticipants,
      currentParticipants,
      isActive: parsedIsActive,
      isFeatured: parsedIsFeatured,
      // universal dates for all event types
      startDate,
      endDate,
    };

    // Add type-specific fields (do NOT add per-type date fields)
    switch (type) {
      case "Voyage":
        Object.assign(eventData, {
          destination,
          departureCity,
          transportType,
          accommodation,
        });
        break;
      case "Excursion":
        Object.assign(eventData, {
          destination,
          durationHours,
          meetingPoint,
          meetingTime,
          equipmentRequired: parseArray(equipmentRequired || req.body.equipmentRequired),
          guideIncluded,
        });
        break;
      case "Club":
        let scheduleArr = schedule || req.body.schedule;
        if (typeof scheduleArr === "string") {
          try {
            scheduleArr = JSON.parse(scheduleArr);
          } catch {
            scheduleArr = [];
          }
        }
        if (Array.isArray(scheduleArr)) {
          scheduleArr = scheduleArr.map((item) => {
            if (typeof item === "string") {
              try {
                return JSON.parse(item);
              } catch {
                return {};
              }
            }
            return item;
          });
        }
        Object.assign(eventData, {
          adresseclub,
          schedule: Array.isArray(scheduleArr) ? scheduleArr : [],
          categoryclub,
          ageGroup,
        });
        break;
      case "Activité":
        Object.assign(eventData, {
          sportType,
          durationMinutes,
          location,
          equipmentProvided: parseArray(equipmentProvided || req.body.equipmentProvided),
        });
        break;
      case "Évènement":
        Object.assign(eventData, {
          eventTime,
          organizer,
          program: parseArray(program || req.body.program),
        });
        break;
      default:
        break;
    }

    // Create event
    const newEvent = await Event.create(eventData);
    console.log('✅ [Events] Event created successfully, ID:', newEvent._id);

    // Send email notifications to approved users (fire-and-forget)
    const { sendEmail } = require("../../helpers/mailer");
    console.log('✉️ [Events] Queuing email notifications...');
    setImmediate(async () => {
      try {
        console.log('✉️ [Events] Starting email notification process...');

        const approvedUsers = await User.find({
          status: 'Approuvé',
          userEmail: { $exists: true, $ne: '' }
        }).select('userEmail firstName').lean();

        console.log(`✉️ [Events] Found ${approvedUsers.length} approved users with emails`);

        const recipients = approvedUsers.map(u => ({ to: u.userEmail, name: u.firstName || '' })).filter(r => r.to);

        if (recipients.length === 0) {
          console.log('✉️ [Events] No valid emails to send to');
          return;
        }

        const { eventCreatedTemplate } = require("../../helpers/emailTemplates");
        const tmpl = eventCreatedTemplate(newEvent);
        const subject = tmpl.subject;
        const text = tmpl.text;
        const html = tmpl.html;

        // send in batches
        const concurrency = 10;
        let sent = 0, failed = 0;
        for (let i = 0; i < recipients.length; i += concurrency) {
          const batch = recipients.slice(i, i + concurrency);
          const results = await Promise.allSettled(batch.map(r => sendEmail({ to: r.to, subject, text, html })));
          results.forEach(r => { if (r.status === 'fulfilled' && r.value && r.value.success) sent++; else failed++; });
          console.log(`✉️ [Events] Batch processed: sent ${sent}, failed ${failed}`);
        }

        console.log(`✉️ [Events] Email notifications completed: sent ${sent}/${recipients.length}, failed ${failed}`);
      } catch (emailErr) {
        console.error('❌ [Events] Email notification failed:', emailErr.message, emailErr.stack);
      }
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    next(error);
  }
};

// Get all events with optional search
const getEvents = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { destination: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const events = await Event.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// Update an event (handles all types)
const updateEvent = async (req, res, next) => {
  const parseArray = (val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return Array.isArray(val) ? val : [];
  };

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Validate input
    const validationErrors = validateEventInput(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(", "),
      });
    }

    // --- Image Handling Block ---
    const oldImages = [...event.images];

    // Support both removeImages and removedImageUrls from the client
    let removedImageUrls = [];
    if (req.body.removedImageUrls) {
      try {
        removedImageUrls = typeof req.body.removedImageUrls === 'string'
          ? JSON.parse(req.body.removedImageUrls)
          : req.body.removedImageUrls;
      } catch (err) {
        console.error('Error parsing removedImageUrls:', err);
        return res.status(400).json({ success: false, message: 'Invalid format for removedImageUrls' });
      }
    }

    const imagesToRemoveFromField = Array.isArray(req.body.removeImages)
      ? req.body.removeImages
      : parseArray(req.body.removeImages);

    // Merge both sources into one list
    const imagesToRemoveList = Array.isArray(removedImageUrls) ? [...removedImageUrls] : [];
    if (Array.isArray(imagesToRemoveFromField)) imagesToRemoveFromField.forEach(i => imagesToRemoveList.push(i));

    // Normalize to basenames for matching
    const removedFilenames = imagesToRemoveList.map(item => path.basename(String(item)));

    // Process new uploads
    let newImagePaths = [];
    if (req.files?.length > 0) {
      newImagePaths = req.files.map((file) => {
        const relativePath = path.relative(UPLOADS_ROOT, file.path);
        // Prepend 'uploads/' to match the format expected by safeDeleteFile
        return normalizeFilePath(path.join('uploads', relativePath));
      });
    }

    // Determine which existing images (full stored paths) match the filenames to remove
    const imagesToDelete = oldImages.filter(img => removedFilenames.includes(path.basename(img)));
    const keptImages = oldImages.filter(img => !removedFilenames.includes(path.basename(img)));

    // Combine kept existing images with newly uploaded ones, then deduplicate preserving order
    const rawFinalImages = [...keptImages, ...newImagePaths];
    const finalImages = rawFinalImages.filter((v, i, a) => a.indexOf(v) === i);

    // Assign images to event now (actual file deletions occur_AFTER_ successful save)
    event.images = finalImages;
    event.featuredPhoto = event.images[0] || null;

    // --- Update Base Fields ---
    event.title = req.body.title;
    event.type = req.body.type;
    event.description = req.body.description;
    // Ensure startDate/endDate are updated if provided
    event.startDate = req.body.startDate || event.startDate;
    event.endDate = req.body.endDate || event.endDate;
    // Number of companions and children
    event.numberOfCompanions = req.body.numberOfCompanions !== undefined ? Number(req.body.numberOfCompanions) : event.numberOfCompanions;
    event.numberOfChildren = req.body.numberOfChildren !== undefined ? Number(req.body.numberOfChildren) : event.numberOfChildren;
    event.maxParticipants = req.body.maxParticipants || event.maxParticipants;
    event.currentParticipants = req.body.currentParticipants || event.currentParticipants;
    event.isActive = req.body.isActive !== undefined ? (req.body.isActive === true || req.body.isActive === "true") : event.isActive;
    event.isFeatured = req.body.isFeatured !== undefined ? (req.body.isFeatured === true || req.body.isFeatured === "true") : event.isFeatured;

    // --- Pricing ---
    event.pricing = req.body.basePrice || req.body.pricing || event.pricing;
    event.cojoinPresence = req.body.cojoinPresence !== undefined
      ? (req.body.cojoinPresence === true || req.body.cojoinPresence === "true")
      : event.cojoinPresence;
    event.cojoinPrice = req.body.cojoinPrice || event.cojoinPrice;
    event.childPresence = req.body.childPresence !== undefined
      ? (req.body.childPresence === true || req.body.childPresence === "true")
      : event.childPresence;
    event.childPrice = req.body.childPrice || event.childPrice;

    // --- Includes (optional) ---
    let includesArr = req.body.includes;
    if (typeof includesArr === "string") {
      try {
        includesArr = JSON.parse(includesArr);
      } catch {
        includesArr = [includesArr];
      }
    }
    event.includes = Array.isArray(includesArr) ? includesArr : [];

    // --- Type-Specific Logic ---
    switch (event.type) {
      case "Voyage":
        event.startDate = req.body.startDate || event.startDate;
        event.endDate = req.body.endDate || event.endDate;
        event.destination = req.body.destination || event.destination;
        event.departureCity = req.body.departureCity || event.departureCity;
        event.transportType = req.body.transportType || event.transportType;
        event.accommodation = req.body.accommodation || event.accommodation;
        break;

      case "Excursion":
        // use common startDate/endDate (no per-type date field)
        event.destination = req.body.destination || event.destination;
        event.durationHours = req.body.durationHours || event.durationHours;
        event.meetingPoint = req.body.meetingPoint || event.meetingPoint;
        event.meetingTime = req.body.meetingTime || event.meetingTime;
        event.equipmentRequired = parseArray(req.body.equipmentRequired || event.equipmentRequired);
        event.guideIncluded = req.body.guideIncluded !== undefined ? req.body.guideIncluded : event.guideIncluded;
        break;

      case "Club":
        event.adresseclub = req.body.adresseclub || event.adresseclub;

        let scheduleArr = req.body.schedule;
        if (typeof scheduleArr === "string") {
          try {
            scheduleArr = JSON.parse(scheduleArr);
          } catch {
            scheduleArr = [scheduleArr];
          }
        }
        event.schedule = Array.isArray(scheduleArr) ? scheduleArr : [];
        event.categoryclub = req.body.categoryclub || event.categoryclub;
        event.ageGroup = req.body.ageGroup || event.ageGroup;
        break;

      case "Activité":
        // use common startDate/endDate (no per-type date field)
        event.sportType = req.body.sportType || event.sportType;
        event.durationMinutes = req.body.durationMinutes || event.durationMinutes;
        event.location = req.body.location || event.location;
        event.equipmentProvided = parseArray(req.body.equipmentProvided || event.equipmentProvided);
        break;

      case "Évènement":
        // use common startDate/endDate (no per-type date field)
        event.eventTime = req.body.eventTime || event.eventTime;
        event.organizer = req.body.organizer || event.organizer;
        event.program = parseArray(req.body.program || event.program);
        break;

      default:
        break;
    }

    // Save updated event
    const updatedEvent = await event.save();

    // After update: notify approved users by email about the update
    try {
      const { sendEmail } = require("../../helpers/mailer");
      console.log('✉️ [Events] Queuing update notification emails...');
      setImmediate(async () => {
        try {
          const approvedUsers = await User.find({ status: 'Approuvé', userEmail: { $exists: true, $ne: '' } }).select('userEmail firstName').lean();
          const recipients = approvedUsers.map(u => ({ to: u.userEmail, name: u.firstName || '' })).filter(r => r.to);
          if (recipients.length === 0) return;

          const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' });
          };

          const { eventUpdatedTemplate } = require("../../helpers/emailTemplates");
          const tmpl = eventUpdatedTemplate(updatedEvent);
          const subject = tmpl.subject;
          const text = tmpl.text;
          const html = tmpl.html;

          const concurrency = 10;
          let sent = 0, failed = 0;
          for (let i = 0; i < recipients.length; i += concurrency) {
            const batch = recipients.slice(i, i + concurrency);
            const results = await Promise.allSettled(batch.map(r => sendEmail({ to: r.to, subject, text, html })));
            results.forEach(r => { if (r.status === 'fulfilled' && r.value && r.value.success) sent++; else failed++; });
          }
          console.log(`✉️ [Events] Update notification emails queued: sent ${sent}/${recipients.length}, failed ${failed}`);
        } catch (e) {
          console.error('❌ [Events] Failed to queue update notification emails:', e.message);
        }
      });
    } catch (e) {
      console.error('❌ [Events] Error scheduling update emails:', e.message);
    }

    // Cleanup removed images (after successful save)
    if (imagesToDelete?.length > 0) {
      try {
        await cleanupImages(imagesToDelete);
      } catch (err) {
        console.error('Image cleanup error after event update:', err);
      }
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error && (error.stack || error));
    // Cleanup newly uploaded files on error
    if (req.files?.length > 0) {
      try {
        req.files.forEach(file => safeDeleteFile(file.path));
      } catch (cleanupErr) {
        console.error('Error cleaning up uploaded files after failure:', cleanupErr);
      }
    }
    next(error);
  }
};

// Delete event and associated images
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Delete images from uploads folder
    if (event.images && event.images.length > 0) {
      event.images.forEach((imagePath) => {
        safeDeleteFile(imagePath);
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  getAllBookings,
};
