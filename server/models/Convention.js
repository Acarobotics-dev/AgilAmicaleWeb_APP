const mongoose = require("mongoose");

const ConventionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  imagePath: {
    type: String,
    required: [true, "Image is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  filePath: {
    type: String,
    required: [true, "Document file is required"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ConventionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Convention", ConventionSchema);