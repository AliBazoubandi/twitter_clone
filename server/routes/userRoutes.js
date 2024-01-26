const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateUser = require('../middlewares/authenticateUser');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/logout', authenticateUser, userController.logoutUser);
router.get('/:userId', authenticateUser, userController.getUserById);
router.post('/follow/:targetUserId', authenticateUser, userController.followUser);
router.delete('/unfollow/:targetUserId', authenticateUser, userController.unfollowUser);

module.exports = router;
