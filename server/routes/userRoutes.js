const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateUser = require('../middlewares/authenticateUser');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/:userId', authenticateUser, userController.getUserById);

module.exports = router;
