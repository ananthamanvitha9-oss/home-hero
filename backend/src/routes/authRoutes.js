const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateVerifyOtp } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/verify-otp', validateVerifyOtp, authController.verifyOtp);
router.post('/logout', authController.logout);

module.exports = router;
