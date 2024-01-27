const mongoose = require('mongoose');
const removeRetweets = require('../middlewares/removeRetweets');

const tweetSchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 250 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: { type: String }, // Assuming media is a URL to an image or video
  hashtags: [{ type: String }],
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],
  likeCount: { type: Number, default: 0 },
  retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

tweetSchema.pre('remove', async function (next) {
  const tweetId = this._id;
  try {
      await removeRetweets(tweetId);
      next();
  } catch (error) {
      console.error('Error in pre-remove middleware:', error);
      next(error);
  }
});

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;