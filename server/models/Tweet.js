const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 250 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: { type: String }, // Assuming media is a URL to an image or video
  hashtags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
