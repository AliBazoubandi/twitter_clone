const Tweet = require("../models/Tweet");
const User = require("../models/User");
const removeRetweets = require("../middlewares/removeRetweets");

const tweetController = {
  createTweet: async (req, res) => {
    const { text, media, hashtags } = req.body;
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newTweet = new Tweet({ text, user: userId, media, hashtags });
      await newTweet.save();

      user.tweets.push(newTweet._id);
      await user.save();

      res.status(201).json({ message: "Tweet created successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteTweet: async (req, res) => {
    const tweetId = req.params.tweetId;
    const userId = req.user._id;

    try {
      const tweet = await Tweet.findById(tweetId);

      if (!tweet) {
        return res.status(404).json({ error: "Tweet not found" });
      }

      if (tweet.user.toString() !== userId) {
        return res
          .status(403)
          .json({ error: "You do not have permission to delete this tweet" });
      }

      // Remove retweets
      const retweetUserIds = tweet.retweets.map((retweet) =>
        retweet.toString()
      );
      await User.updateMany(
        { _id: { $in: retweetUserIds } },
        { $pull: { retweets: tweetId } }
      );

      // Remove tweet from owner's tweets
      await User.findByIdAndUpdate(userId, { $pull: { tweets: tweetId } });

      // Remove tweet
      await Tweet.deleteOne({ _id: tweetId });

      res.json({ message: "Tweet deleted successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  retweet: async (req, res) => {
    const userId = req.user._id;
    const { tweetId } = req.params;

    try {
      const user = await User.findById(userId);
      const tweet = await Tweet.findById(tweetId);

      if (!user || !tweet) {
        return res.status(404).json({ error: "User or tweet not found" });
      }

      if (user.retweets.includes(tweetId)) {
        return res.status(400).json({ error: "Tweet already retweeted" });
      }

      const tweetOwner = await User.findByIdAndUpdate(
        tweet.user,
        {
          $push: {
            activities: {
              type: "retweet",
              timestamp: new Date(),
              user: userId,
              tweet: tweetId,
            },
          },
        },
        { new: true }
      );

      user.retweets.push(tweetId);
      await user.save();

      tweet.retweets.push(userId);
      await tweet.save();

      res.json({ message: "Retweet successful!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  likeTweet: async (req, res) => {
    const userId = req.user._id;
    const { tweetId } = req.params;

    try {
      const tweet = await Tweet.findById(tweetId);

      if (!tweet) {
        return res.status(404).json({ error: "Tweet not found" });
      }

      // Check if the user has already liked the tweet
      const hasLiked = tweet.likes.some(
        (like) => like.user.toString() === userId
      );

      if (hasLiked) {
        // If the user has already liked, remove the like
        tweet.likes = tweet.likes.filter(
          (like) => like.user.toString() !== userId
        );
        tweet.likeCount -= 1;
      } else {
        // If the user hasn't liked, add the like
        tweet.likes.push({ user: userId });
        tweet.likeCount += 1;

        const tweetOwner = await User.findByIdAndUpdate(
          tweet.user,
          {
            $push: {
              activities: {
                type: "like",
                timestamp: new Date(),
                user: userId,
                tweet: tweetId,
              },
            },
          },
          { new: true }
        );
      }

      await tweet.save();

      res.json({ message: "Tweet liked/unliked successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getTweetById: async (req, res) => {
    const tweetId = req.params.tweetId;

    try {
      const tweet = await Tweet.findById(tweetId);
      if (!tweet) {
        return res.status(404).json({ error: "Tweet not found" });
      }

      res.json(tweet);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllTweets: async (req, res) => {
    try {
      const tweets = await Tweet.find().populate("user", "username");
      res.json(tweets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getHomeTweets: async (req, res) => {
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const followingUsers = user.following || [];

      // Retrieve tweets from users the current user follows
      const homeTweets = await Tweet.find({ user: { $in: followingUsers } })
        .populate("user", "username")
        .sort({ createdAt: -1 });

      res.json(homeTweets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = tweetController;
