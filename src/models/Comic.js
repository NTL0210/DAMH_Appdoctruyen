const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
  comicId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  originName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus'],
    default: 'ongoing'
  },
  thumbUrl: {
    type: String,
    default: ''
  },
  chaptersLatest: [{
    chapterId: String,
    chapterName: String,
    chapterTitle: String
  }],
  comicGenres: [{
    genreId: String,
    name: String
  }]
}, {
  timestamps: true
});

// Indexes
comicSchema.index({ comicId: 1 }, { unique: true });
comicSchema.index({ slug: 1 }, { unique: true });
comicSchema.index({ name: 'text' });
comicSchema.index({ status: 1 });

module.exports = mongoose.model('Comic', comicSchema);
