require('dotenv').config({ path: '../scripts/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/twitter_clone');

const User = require('./models/User');
const Tweet = require('./models/Tweet');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'fallback_secret_key';

// Registration route
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
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
  
      // Generate a JWT token upon successful login
      const token = jwt.sign({ user: { _id: user._id } }, secretKey);
  
      // Set the token as an HTTP cookie
      res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
  
      res.json({ message: 'Login successful!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a tweet route
app.post('/api/tweets', authenticateUser, async (req, res) => {
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
});
  
// Middleware to authenticate users
function authenticateUser(req, res, next) {
    const token = req.header('Authorization') || req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }
  
    try {
      const secretKey = process.env.SECRET_KEY || 'fallback_secret_key';
      const decoded = jwt.verify(token, secretKey);
  
      req.user = decoded.user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
}

// Get all tweets route
app.get('/api/tweets', async (req, res) => {
  try {
    const tweets = await Tweet.find().populate('user', 'username');
    res.json(tweets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
    res.send('Server is running!');
  });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});
