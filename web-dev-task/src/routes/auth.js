const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Signup
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

// Get User Details
router.get('/user', authMiddleware, authController.getUserDetails);

// Forgot Password
router.post('/forgot-password', authController.forgotPassword);

// Reset Password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
