const fileService = require('../../../src/services/fileService');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

jest.mock('sharp');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    unlink: jest.fn()
  }
}));

describe('FileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateImage', () => {
    it('should validate valid JPEG file', () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      };

      const result = fileService.validateImage(file);

      expect(result.valid).toBe(true);
    });

    it('should validate valid PNG file', () => {
      const file = {
        mimetype: 'image/png',
        size: 2 * 1024 * 1024 // 2MB
      };

      const result = fileService.validateImage(file);

      expect(result.valid).toBe(true);
    });

    it('should validate valid WebP file', () => {
      const file = {
        mimetype: 'image/webp',
        size: 3 * 1024 * 1024 // 3MB
      };

      const result = fileService.validateImage(file);

      expect(result.valid).toBe(true);
    });

    it('should reject file with invalid mimetype', () => {
      const file = {
        mimetype: 'image/gif',
        size: 1024 * 1024
      };

      const result = fileService.validateImage(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject file exceeding size limit', () => {
      const file = {
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024 // 6MB
      };

      const result = fileService.validateImage(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('File size exceeds');
    });

    it('should reject when no file provided', () => {
      const result = fileService.validateImage(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file provided');
    });
  });

  describe('resizeImage', () => {
    it('should resize image to 512x512', async () => {
      const mockBuffer = Buffer.from('test');
      const mockResizedBuffer = Buffer.from('resized');

      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockResizedBuffer)
      };

      sharp.mockReturnValue(mockSharp);

      const result = await fileService.resizeImage(mockBuffer);

      expect(sharp).toHaveBeenCalledWith(mockBuffer);
      expect(mockSharp.resize).toHaveBeenCalledWith(512, 512, {
        fit: 'cover',
        position: 'center'
      });
      expect(mockSharp.jpeg).toHaveBeenCalledWith({ quality: 90 });
      expect(result).toBe(mockResizedBuffer);
    });

    it('should resize image to custom dimensions', async () => {
      const mockBuffer = Buffer.from('test');
      const mockResizedBuffer = Buffer.from('resized');

      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockResizedBuffer)
      };

      sharp.mockReturnValue(mockSharp);

      await fileService.resizeImage(mockBuffer, 256, 256);

      expect(mockSharp.resize).toHaveBeenCalledWith(256, 256, {
        fit: 'cover',
        position: 'center'
      });
    });

    it('should throw error when resize fails', async () => {
      const mockBuffer = Buffer.from('test');

      sharp.mockImplementation(() => {
        throw new Error('Invalid image');
      });

      await expect(fileService.resizeImage(mockBuffer)).rejects.toThrow('Image resize failed');
    });
  });

  describe('uploadAvatar', () => {
    it('should upload and process avatar successfully', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test'),
        originalname: 'avatar.jpg'
      };

      const mockResizedBuffer = Buffer.from('resized');

      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockResizedBuffer)
      };

      sharp.mockReturnValue(mockSharp);
      fs.access.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const result = await fileService.uploadAvatar(mockFile, 'user123');

      expect(fs.writeFile).toHaveBeenCalled();
      expect(result).toMatch(/^\/uploads\/avatars\/user123_[a-f0-9]+\.jpg$/);
    });

    it('should create upload directory if not exists', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test'),
        originalname: 'avatar.jpg'
      };

      const mockResizedBuffer = Buffer.from('resized');

      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockResizedBuffer)
      };

      sharp.mockReturnValue(mockSharp);
      fs.access.mockRejectedValue(new Error('ENOENT'));
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await fileService.uploadAvatar(mockFile, 'user123');

      expect(fs.mkdir).toHaveBeenCalled();
    });

    it('should throw error for invalid file', async () => {
      const mockFile = {
        mimetype: 'image/gif',
        size: 1024 * 1024,
        buffer: Buffer.from('test'),
        originalname: 'avatar.gif'
      };

      await expect(fileService.uploadAvatar(mockFile, 'user123')).rejects.toThrow('Invalid file type');
    });

    it('should throw error when file write fails', async () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024,
        buffer: Buffer.from('test'),
        originalname: 'avatar.jpg'
      };

      const mockResizedBuffer = Buffer.from('resized');

      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(mockResizedBuffer)
      };

      sharp.mockReturnValue(mockSharp);
      fs.access.mockResolvedValue();
      fs.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(fileService.uploadAvatar(mockFile, 'user123')).rejects.toThrow('Avatar upload failed');
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      fs.unlink.mockResolvedValue();

      await fileService.deleteFile('/uploads/avatars/test.jpg');

      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should not throw error if file does not exist', async () => {
      const error = new Error('File not found');
      error.code = 'ENOENT';
      fs.unlink.mockRejectedValue(error);

      await expect(fileService.deleteFile('/uploads/avatars/test.jpg')).resolves.not.toThrow();
    });

    it('should throw error for other file system errors', async () => {
      const error = new Error('Permission denied');
      error.code = 'EACCES';
      fs.unlink.mockRejectedValue(error);

      await expect(fileService.deleteFile('/uploads/avatars/test.jpg')).rejects.toThrow('File deletion failed');
    });
  });
});
