const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get User Details Route
router.get('/details', userController.getUserDetails);

module.exports = router;
