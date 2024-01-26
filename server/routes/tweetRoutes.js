const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const authenticateUser = require('../middlewares/authenticateUser');

router.post('/', authenticateUser, tweetController.createTweet);
router.get('/', tweetController.getAllTweets);
router.get('/home', authenticateUser, tweetController.getHomeTweets);

module.exports = router;
