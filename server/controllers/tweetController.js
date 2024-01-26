const Tweet = require('../models/Tweet');
const User = require('../models/User');

const tweetController = {
  createTweet: async (req, res) => {
    const { text, media, hashtags } = req.body;
    const userId = req.user._id;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newTweet = new Tweet({ text, user: userId, media, hashtags });
      await newTweet.save();

      res.status(201).json({ message: 'Tweet created successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getAllTweets: async (req, res) => {
    try {
      const tweets = await Tweet.find().populate('user', 'username');
      res.json(tweets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getHomeTweets: async (req, res) => {
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const followingUsers = user.following || [];
  
      // Retrieve tweets from users the current user follows
      const homeTweets = await Tweet.find({ user: { $in: followingUsers } })
        .populate('user', 'username')
        .sort({ createdAt: -1 });
  
      res.json(homeTweets);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = tweetController;
