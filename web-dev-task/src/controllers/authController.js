const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user'); // Import your User model
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Helper function to send the email
const sendResetPasswordEmail = (user, resetToken) => {
  const resetUrl = `http://localhost:5000/reset-password/${resetToken}` // Adjust for your production URL
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset',
    html: `<p>You requested a password reset</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 5 minutes.</p>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error sending email:', err);
    } else {
      console.log('Password reset email sent:', info.response);
    }
  });
};

// Signup function
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT payload and sign the token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user details function
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Forgot password function (generate reset link)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Send reset password email
    sendResetPasswordEmail(user, resetToken);

    res.status(200).json({ msg: 'Reset password email sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Reset password function (update password after clicking reset link)
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Find the user by reset token and check if the token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ msg: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};