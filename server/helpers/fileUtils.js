const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Define the canonical uploads root directory
const UPLOADS_ROOT = path.resolve(__dirname, '../uploads');

/**
 * Construct a safe absolute path for an uploaded file
 * @param {string} relativePath - The relative path from uploads root
 * @returns {string} - The absolute path
 */
const getAbsolutePath = (relativePath) => {
  if (!relativePath) return null;

  // If already absolute and within uploads, use it; otherwise resolve from UPLOADS_ROOT
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }

  return path.resolve(UPLOADS_ROOT, relativePath);
};

/**
 * Safely delete a file asynchronously
 * @param {string} filePath - The file path (can be relative to uploads or absolute)
 * @returns {Promise<void>}
 */
const safeDeleteFile = async (filePath) => {
  if (!filePath) return;

  try {
    // Resolve the full path using getAbsolutePath
    let fullPath;
    if (path.isAbsolute(filePath)) {
      // Normalize the absolute path
      fullPath = path.normalize(filePath);
    } else {
      // Resolve relative to server root (parent of helpers)
      fullPath = path.resolve(__dirname, '../', filePath);
    }

    // Ensure the resolved path is within UPLOADS_ROOT
    const normalizedFullPath = path.normalize(fullPath);
    const normalizedUploadsRoot = path.normalize(UPLOADS_ROOT);

    if (!normalizedFullPath.startsWith(normalizedUploadsRoot)) {
      console.warn(`⚠️ Refused to delete file outside uploads directory: ${filePath}`);
      return;
    }

    await fs.access(fullPath);
    await fs.unlink(fullPath);
    console.log(`✅ Deleted file: ${filePath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`⚠️ File not found: ${filePath}`);
    } else {
      console.error(`❌ Error deleting file ${filePath}:`, err.message);
      throw err;
    }
  }
};

/**
 * Safely delete a file synchronously (for immediate cleanup in catch blocks)
 * @param {string} filePath - The file path (can be relative to uploads or absolute)
 */
const safeDeleteFileSync = (filePath) => {
  if (!filePath) return;

  try {
    // Resolve the full path
    let fullPath;
    if (path.isAbsolute(filePath)) {
      fullPath = path.normalize(filePath);
    } else {
      fullPath = path.resolve(__dirname, '../', filePath);
    }

    // Ensure the resolved path is within UPLOADS_ROOT
    const normalizedFullPath = path.normalize(fullPath);
    const normalizedUploadsRoot = path.normalize(UPLOADS_ROOT);

    if (!normalizedFullPath.startsWith(normalizedUploadsRoot)) {
      console.warn(`⚠️ Refused to delete file outside uploads directory (sync): ${filePath}`);
      return;
    }

    if (fsSync.existsSync(fullPath)) {
      fsSync.unlinkSync(fullPath);
      console.log(`✅ Deleted file (sync): ${filePath}`);
    } else {
      console.warn(`⚠️ File not found (sync): ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Error deleting file (sync) ${filePath}:`, err.message);
  }
};

/**
 * Safely delete multiple files asynchronously
 * @param {string[]} filePaths - Array of file paths
 * @returns {Promise<void>}
 */
const safeDeleteFiles = async (filePaths) => {
  if (!Array.isArray(filePaths) || filePaths.length === 0) return;

  await Promise.all(filePaths.map(fp => safeDeleteFile(fp)));
};

/**
 * Normalize a file path for storage (ensure consistent format)
 * @param {string} filePath - The file path to normalize
 * @returns {string} - Normalized path with forward slashes
 */
const normalizeFilePath = (filePath) => {
  if (!filePath) return '';
  return filePath.replace(/\\/g, '/');
};

module.exports = {
  UPLOADS_ROOT,
  getAbsolutePath,
  safeDeleteFile,
  safeDeleteFileSync,
  safeDeleteFiles,
  normalizeFilePath
};
