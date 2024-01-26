const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const authenticateUser = require('../middlewares/authenticateUser');

// Create a tweet route
router.post('/', authenticateUser, tweetController.createTweet);

// Get all tweets route
router.get('/', tweetController.getAllTweets);

module.exports = router;
