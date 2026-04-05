const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

/**
 * File Service
 * Handles avatar uploads, validation, and image processing
 */
class FileService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads/avatars');
    this.allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.targetSize = { width: 512, height: 512 };
  }

  /**
   * Initialize upload directory
   */
  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate image file
   * @param {Object} file - Multer file object
   * @returns {Object} - { valid: boolean, error?: string }
   */
  validateImage(file) {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' 
      };
    }

    if (file.size > this.maxFileSize) {
      return { 
        valid: false, 
        error: `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Resize image to target dimensions
   * @param {Buffer} buffer - Image buffer
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @returns {Promise<Buffer>} - Resized image buffer
   */
  async resizeImage(buffer, width = this.targetSize.width, height = this.targetSize.height) {
    try {
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toBuffer();
    } catch (error) {
      throw new Error(`Image resize failed: ${error.message}`);
    }
  }

  /**
   * Upload and process avatar
   * @param {Object} file - Multer file object
   * @param {string} userId - User ID
   * @returns {Promise<string>} - Avatar URL
   */
  async uploadAvatar(file, userId) {
    // Validate file
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Ensure upload directory exists
    await this.ensureUploadDir();

    // Generate unique filename
    const fileExt = path.extname(file.originalname) || '.jpg';
    const filename = `${userId}_${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      // Resize image
      const resizedBuffer = await this.resizeImage(file.buffer);

      // Save to disk
      await fs.writeFile(filepath, resizedBuffer);

      // Return URL path (relative to server)
      return `/uploads/avatars/${filename}`;
    } catch (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from disk
   * @param {string} filePath - File path to delete
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '../..', filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      // Ignore errors if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw new Error(`File deletion failed: ${error.message}`);
      }
    }
  }
}

module.exports = new FileService();
