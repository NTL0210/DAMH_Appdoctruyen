const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comicId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index
followSchema.index({ accountId: 1, comicId: 1 }, { unique: true });
followSchema.index({ accountId: 1 });
followSchema.index({ comicId: 1 });

module.exports = mongoose.model('Follow', followSchema);
