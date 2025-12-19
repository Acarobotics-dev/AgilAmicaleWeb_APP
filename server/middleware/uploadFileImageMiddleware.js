const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuration constants (allow override by env)
const UPLOAD_ROOT = process.env.UPLOAD_ROOT_DIR || 'uploads';
const UPLOAD_CONFIG = {
  ROOT_DIR: UPLOAD_ROOT,
  PATHS: {
    DOCUMENTS: 'documents',
    IMAGES: 'images'
  },
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    PDF: ['application/pdf']
  },
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  FILENAME_PREFIXES: {
    DOCUMENT: 'doc-',
    IMAGE: 'img-'
  }
};

// Helper to get full upload path
const getUploadPath = (type) => path.join(UPLOAD_CONFIG.ROOT_DIR, UPLOAD_CONFIG.PATHS[type]);

// Ensure upload directories exist
const initializeUploadDirectories = () => {
  Object.values(UPLOAD_CONFIG.PATHS).forEach(subdir => {
    const dir = path.join(UPLOAD_CONFIG.ROOT_DIR, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      // Optional: log directory creation
      // console.log(`Created upload directory: ${dir}`);
    }
  });
};

initializeUploadDirectories();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    if (file.fieldname === 'file') {
      uploadPath = getUploadPath('DOCUMENTS');
    } else if (file.fieldname === 'image') {
      uploadPath = getUploadPath('IMAGES');
    } else {
      // Unknown field, fallback to root
      uploadPath = UPLOAD_CONFIG.ROOT_DIR;
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Optionally include user id if available
    const userId = req.user ? req.user.id || req.user._id : null;
    const prefix = file.fieldname === 'file'
      ? UPLOAD_CONFIG.FILENAME_PREFIXES.DOCUMENT
      : UPLOAD_CONFIG.FILENAME_PREFIXES.IMAGE;
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = uuidv4();
    const filename = userId
      ? `${prefix}${userId}-${uniqueId}${ext}`
      : `${prefix}${uniqueId}${ext}`;
    cb(null, filename);
  }
});

// File validation
const fileValidator = (req, file, cb) => {
  try {
    if (file.fieldname === 'file') {
      if (!UPLOAD_CONFIG.ALLOWED_TYPES.PDF.includes(file.mimetype)) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'), false);
      }
    } else if (file.fieldname === 'image') {
      if (!UPLOAD_CONFIG.ALLOWED_TYPES.IMAGES.includes(file.mimetype)) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'), false);
      }
    } else {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname), false);
    }
    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
};

// Create the upload middleware
const fileUploadMiddleware = multer({
  storage: storage,
  fileFilter: fileValidator,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 2 // Maximum of 2 files (1 document + 1 image)
  }
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

// Error handling middleware wrapper
const uploadFileImage = (req, res, next) => {
  fileUploadMiddleware(req, res, (err) => {
    if (err) {
      // Multer errors
      if (err instanceof multer.MulterError) {
        let message = 'File upload error';
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'File size exceeds the 20MB limit';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          if (err.field === 'file') {
            message = 'Only PDF documents are allowed';
          } else if (err.field === 'image') {
            message = 'Only JPEG, PNG, JPG, or WEBP images are allowed';
          } else {
            message = `Unexpected file field: ${err.field}`;
          }
        }
        return res.status(400).json({
          success: false,
          message
        });
      } else if (err.message && err.message.includes('Only')) {
        // Our custom validation errors
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      // Other unexpected errors
      // Optionally log error details
      // console.error('File upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during file upload'
      });
    }
    next();
  });
};

module.exports = uploadFileImage;