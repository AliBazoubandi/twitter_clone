const mongoose = require("mongoose");
const removeRetweets = require("../middlewares/removeRetweets");

const tweetSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 250 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    media: { type: String }, 
    hashtags: [{ type: String }],
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    retweets: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tweetSchema.pre("remove", async function (next) {
  const tweetId = this._id;
  try {
    await removeRetweets(tweetId);
    next();
  } catch (error) {
    console.error("Error in pre-remove middleware:", error);
    next(error);
  }
});

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
