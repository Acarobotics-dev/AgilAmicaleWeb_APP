const Convention = require("../../models/Convention");
const path = require("path");
const { safeDeleteFileSync, normalizeFilePath } = require("../../helpers/fileUtils");

// Helper function to validate convention input
const validateConventionInput = (body) => {
  const errors = [];
  if (!body.title || body.title.trim() === "") {
    errors.push("Title is required");
  }
  if (!body.description || body.description.trim() === "") {
    errors.push("Description is required");
  }
  return errors.length > 0 ? errors : null;
};

// Create a new convention
const createConvention = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Check if files are uploaded
    if (!req.files || !req.files['file'] || !req.files['image']) {
      return res.status(400).json({ message: 'Both file and image are required' });
    }

    const conventionFile = req.files['file'][0];
    const conventionImage = req.files['image'][0];

    // Normalize file paths
    const filePath = conventionFile.path.replace(/\\/g, '/');
    const imagePath = conventionImage.path.replace(/\\/g, '/');

    const newConvention = new Convention({
      title,
      description,
      filePath,
      imagePath,
    });

    await newConvention.save();

    res.status(201).json({ message: 'Convention uploaded successfully', convention: newConvention });

  } catch (error) {
    console.error('Error creating convention:', error);
    res.status(500).json({ message: 'Convention upload failed' });
  }
};

// Get all conventions with optional search
const getConventions = async (req, res) => {
  try {
    const query = {};
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const conventions = await Convention.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: conventions.length,
      data: conventions
    });
  } catch (error) {
    console.error("Error fetching conventions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update a convention
const updateConvention = async (req, res) => {
  try {
    const convention = await Convention.findById(req.params.id);
    if (!convention) {
      return res.status(404).json({
        success: false,
        message: "Convention not found"
      });
    }

    // Validate input
    const validationErrors = validateConventionInput(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      });
    }

    // Store old file paths for cleanup
    const oldFiles = {
      image: convention.imagePath,
      file: convention.filePath
    };

    // Update fields
    convention.title = req.body.title;
    convention.description = req.body.description;

    // Handle file updates
    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        convention.imagePath = req.files['image'][0].path.replace(/\\/g, '/');
      }
      if (req.files['file'] && req.files['file'][0]) {
        convention.filePath = req.files['file'][0].path.replace(/\\/g, '/');
      }
    }

    const updatedConvention = await convention.save();

    // Clean up old files after successful update
    if (req.files) {
      if (req.files['image'] && oldFiles.image) safeDeleteFileSync(oldFiles.image);
      if (req.files['file'] && oldFiles.file) safeDeleteFileSync(oldFiles.file);
    }

    res.status(200).json({
      success: true,
      message: "Convention updated successfully",
      data: updatedConvention
    });
  } catch (error) {
    console.error("Error updating convention:", error);

    // Clean up newly uploaded files if error occurred
    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) safeDeleteFileSync(req.files['image'][0].path);
      if (req.files['file'] && req.files['file'][0]) safeDeleteFileSync(req.files['file'][0].path);
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

// Delete a convention
const deleteConvention = async (req, res) => {
  try {
    const convention = await Convention.findById(req.params.id);
    if (!convention) {
      return res.status(404).json({
        success: false,
        message: "Convention not found"
      });
    }

    // Delete the convention from the database
    await Convention.deleteOne({ _id: req.params.id });

    // Delete associated files after successful deletion from the database
    safeDeleteFileSync(convention.imagePath);
    safeDeleteFileSync(convention.filePath);

    res.status(200).json({
      success: true,
      message: "Convention deleted successfully",
      data: {}
    });

  } catch (error) {
    console.error("Error deleting convention:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid convention ID"
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


module.exports = {
  createConvention,
  getConventions,
  updateConvention,
  deleteConvention
};
