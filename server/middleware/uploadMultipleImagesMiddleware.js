const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuration constants
const UPLOAD_CONFIG = {
  ROOT_DIR: 'uploads',
  GALLERY_PATH: 'gallery',
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  MAX_FILES: 20,
  FILENAME_PREFIX: 'img-'
};

// Ensure gallery directory exists
const initializeGalleryDirectory = () => {
  const directory = path.join(UPLOAD_CONFIG.ROOT_DIR, UPLOAD_CONFIG.GALLERY_PATH);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

initializeGalleryDirectory();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOAD_CONFIG.ROOT_DIR, UPLOAD_CONFIG.GALLERY_PATH));
  },
  filename: (req, file, cb) => {
    // Keep original name but sanitize it and ensure no overwrite
    const ext = path.extname(file.originalname).toLowerCase();
    const rawName = path.basename(file.originalname, ext);
    // Replace non-alphanumeric, dot, underscore or dash with hyphen, collapse multiple hyphens, trim
    let safeName = rawName
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-+|-+$)/g, '')
      .toLowerCase();

    if (!safeName) {
      safeName = UPLOAD_CONFIG.FILENAME_PREFIX + Date.now();
    }

    const destDir = path.join(UPLOAD_CONFIG.ROOT_DIR, UPLOAD_CONFIG.GALLERY_PATH);
    let finalName = `${safeName}${ext}`;
    let counter = 0;

    // Avoid overwriting existing files by appending a counter
    while (fs.existsSync(path.join(destDir, finalName))) {
      counter += 1;
      finalName = `${safeName}-${counter}${ext}`;
    }

    cb(null, finalName);
  }
});

// File validation
const fileValidator = (req, file, cb) => {
  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, JPG, or WEBP images are allowed'), false);
  }
  cb(null, true);
};

// Create the upload middleware
const imageUploadMiddleware = multer({
  storage: storage,
  fileFilter: fileValidator,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: UPLOAD_CONFIG.MAX_FILES
  }
}).array('images', UPLOAD_CONFIG.MAX_FILES);

// Error handling middleware wrapper
const uploadMultipleImages = (req, res, next) => {
  imageUploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds the ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit`
          });
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Maximum of ${UPLOAD_CONFIG.MAX_FILES} images can be uploaded at once`
          });
        } else {
          return res.status(400).json({
            success: false,
            message: 'File upload error'
          });
        }
      } else if (err.message.includes('Only')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error during file upload'
      });
    }

    // Add information about uploaded files to the request
    if (req.files && req.files.length > 0) {
      req.uploadedImages = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: path.join(UPLOAD_CONFIG.GALLERY_PATH, file.filename)
      }));
    }

    next();
  });
};

module.exports = uploadMultipleImages;