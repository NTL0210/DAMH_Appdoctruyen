const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comicId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ comicId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentCommentId: 1 }, { sparse: true });

module.exports = mongoose.model('Comment', commentSchema);
