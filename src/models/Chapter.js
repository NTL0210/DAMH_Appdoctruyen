const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  comicId: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  chapterName: {
    type: String,
    required: true
  },
  chapterTitle: {
    type: String,
    default: ''
  },
  chapterIndex: {
    type: Number,
    required: true
  },
  chapterApiData: {
    type: String,
    default: ''
  },
  serverName: {
    type: String,
    default: ''
  },
  filename: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
chapterSchema.index({ comicId: 1 });
chapterSchema.index({ comicId: 1, chapterIndex: 1 }, { unique: true });
chapterSchema.index({ slug: 1 });

module.exports = mongoose.model('Chapter', chapterSchema);
