const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  chapterId: {
    type: String,
    required: true
  },
  pageIndex: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index
pageSchema.index({ chapterId: 1, pageIndex: 1 }, { unique: true });

module.exports = mongoose.model('Page', pageSchema);
