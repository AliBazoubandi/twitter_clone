const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'fallback_secret_key';

const userController = {
  signup: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const newUser = new User({ username, email, password });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ user: { _id: user._id } }, secretKey);

      res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });

      res.json({ message: 'Login successful!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  logoutUser: (req, res) => {
    res.clearCookie('token');

    res.json({ message: 'Logout successful!' });
  },

  getUserById: async (req, res) => {
    const userId = req.params.userId;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userWithoutPassword = { ...user.toObject(), password: undefined };

      res.json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  followUser: async (req, res) => {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    try {
      await User.findByIdAndUpdate(userId, { $addToSet: { following: targetUserId } });

      res.json({ message: 'User followed successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  unfollowUser: async (req, res) => {
    const userId = req.user._id;
    const { targetUserId } = req.params;

    try {
      await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } });

      res.json({ message: 'User unfollowed successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = userController;
