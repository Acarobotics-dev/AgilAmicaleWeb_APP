const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Configuration constants
const UPLOAD_CONFIG = {
  ROOT_DIR: 'uploads',
  IMAGE_DIR: 'images',
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  FILENAME_PREFIX: 'img-'
};

// Ensure upload directory exists
const initializeUploadDirectory = () => {
  const imageDir = path.join(UPLOAD_CONFIG.ROOT_DIR, UPLOAD_CONFIG.IMAGE_DIR);
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }
};

initializeUploadDirectory();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(UPLOAD_CONFIG.ROOT_DIR, UPLOAD_CONFIG.IMAGE_DIR);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = uuidv4();
    cb(null, UPLOAD_CONFIG.FILENAME_PREFIX + uniqueId + ext);
  }
});

// File filter to allow only images
const fileValidator = (req, file, cb) => {
  if (!UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, JPG, or WEBP images are allowed'), false);
  }
  cb(null, true);
};

// Create the upload middleware for a single image
const fileUploadMiddleware = multer({
  storage: storage,
  fileFilter: fileValidator,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE
  }
}).single('logo'); 

// Error handling middleware
const uploadSingleImage = (req, res, next) => {
  fileUploadMiddleware(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.code === 'LIMIT_FILE_SIZE'
            ? 'Image size exceeds the 20MB limit'
            : 'Image upload error'
        });
      } else if (err.message.includes('Only')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error during image upload'
      });
    }
    next();
  });
};

module.exports = uploadSingleImage;
