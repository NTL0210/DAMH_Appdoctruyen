const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comicId: {
    type: String,
    required: true
  },
  chapterId: {
    type: String,
    required: true
  },
  chapterIndex: {
    type: Number,
    default: 0
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  },
  completedChapters: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Compound unique index
readingProgressSchema.index({ accountId: 1, comicId: 1 }, { unique: true });
readingProgressSchema.index({ accountId: 1 });

module.exports = mongoose.model('ReadingProgress', readingProgressSchema);
