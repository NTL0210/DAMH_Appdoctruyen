const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  genreId: {
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
    default: ''
  }
}, {
  timestamps: true
});

// Indexes

module.exports = mongoose.model('Genre', genreSchema);
