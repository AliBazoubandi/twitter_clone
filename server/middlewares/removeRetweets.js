const User = require('../models/User');

module.exports = async function removeRetweets(tweetId) {
    try {
        // Remove the tweet ID from the retweets array of all users
        await User.updateMany({}, { $pull: { retweets: tweetId } });
    } catch (error) {
        console.error('Error removing retweets:', error);
        throw error;
    }
};
