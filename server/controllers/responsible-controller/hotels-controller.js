const Hotel = require("../../models/Hotels");
const User = require("../../models/User");
const path = require("path");
const { safeDeleteFileSync, normalizeFilePath } = require("../../helpers/fileUtils");
const { sendBulkSMS } = require("../../helpers/smsService");

// Helper function to validate hotel input
const validateHotelInput = (body) => {
  const errors = [];
  if (!body.title || body.title.trim() === "") {
    errors.push("Title is required");
  }
  if (!body.link) {
    errors.push("Valid link is required");
  }
  return errors.length > 0 ? errors : null;
};

const createHotel = async (req, res) => {
  try {
    const { title, link } = req.body;

    // Check if logo is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Logo is required' });
    }

    const hotelLogo = req.file;

    // Validate input
    const validationErrors = validateHotelInput(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
    }

    // Normalize file path
    const logoPath = hotelLogo.path.replace(/\\/g, '/');

    const newHotel = new Hotel({
      title,
      logo: logoPath,
      link,
    });

    await newHotel.save();
    console.log('✅ [Hotels] Hotel created successfully, ID:', newHotel._id);

    // Send SMS notifications to approved users (fire-and-forget)
    console.log('📱 [Hotels] Queuing SMS notifications...');
    setImmediate(async () => {
      try {
        console.log('📱 [Hotels] Starting SMS notification process...');

        const approvedUsers = await User.find({
          status: 'Approuvé',
          userPhone: { $exists: true, $ne: '' }
        }).select('userPhone').lean();

        console.log(`📱 [Hotels] Found ${approvedUsers.length} approved users with phone numbers`);

        // Pass raw phone numbers - sendBulkSMS handles normalization internally
        const phones = approvedUsers.map(u => u.userPhone).filter(Boolean);

        console.log(`📱 [Hotels] ${phones.length} phone numbers to process`);

        if (phones.length > 0) {
          // Build personalized message for hotel partnership
          let message = `🏨 AGIL Amicale - Nouveau Partenariat Hôtel!\n\n`;
          message += `⭐ ${title}\n`;
          message += `\n🎁 Profitez de tarifs préférentiels exclusifs pour les membres AGIL Amicale.\n`;
          message += `\n👉 Découvrez les offres sur l'app!`;

          console.log(`📱 [Hotels] Sending SMS for hotel: ${title}`);
          const result = await sendBulkSMS(phones, message);
          console.log(`📱 [Hotels] SMS result:`, result);
        } else {
          console.log('📱 [Hotels] No valid phone numbers to send SMS to');
        }
      } catch (smsErr) {
        console.error('❌ [Hotels] SMS notification failed:', smsErr.message, smsErr.stack);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: newHotel
    });

  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({
      success: false,
      message: 'Hotel creation failed'
    });
  }
};


// Get all hotels with optional search
const getHotels = async (req, res) => {
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { link: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const hotels = await Hotel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// Update a hotel - CORRECTED VERSION
const updateHotel = async (req, res) => {
  let newLogoPath = null;

  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    // Validate input
    const validationErrors = validateHotelInput(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
    }

    // Store old logo path for cleanup
    const oldLogo = hotel.logo;

    // Update fields
    hotel.title = req.body.title;
    hotel.link = req.body.link;

    // Handle new logo if uploaded
    if (req.file) {
      newLogoPath = req.file.path.replace(/\\/g, '/');
      hotel.logo = newLogoPath;
    }

    const updatedHotel = await hotel.save();

    // Clean up old logo AFTER successful update
    if (req.file && oldLogo) {
      safeDeleteFileSync(oldLogo);
    }

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: updatedHotel
    });

  } catch (error) {
    console.error("Error updating hotel:", error);

    // Clean up newly uploaded file if error occurred
    if (newLogoPath) {
      safeDeleteFileSync(newLogoPath);
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete a hotel
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found"
      });
    }

    // Delete the hotel from the database
    await Hotel.deleteOne({ _id: req.params.id });

    // Delete associated logo after successful deletion from the database
    safeDeleteFileSync(hotel.logo);

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
      data: {}
    });

  } catch (error) {
    console.error("Error deleting hotel:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  createHotel,
  getHotels,
  updateHotel,
  deleteHotel
};