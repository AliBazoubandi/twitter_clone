const express = require("express");
const router = express.Router();
const tweetController = require("../controllers/tweetController");
const authenticateUser = require("../middlewares/authenticateUser");

router.post("/", authenticateUser, tweetController.createTweet);
router.get("/", tweetController.getAllTweets);
router.get("/home", authenticateUser, tweetController.getHomeTweets);
router.get("/search", tweetController.searchTweets); // Move this line up
router.get("/:tweetId", tweetController.getTweetById);
router.post("/retweet/:tweetId", authenticateUser, tweetController.retweet);
router.delete("/:tweetId", authenticateUser, tweetController.deleteTweet);
router.post("/:tweetId/like", authenticateUser, tweetController.likeTweet);

module.exports = router;
