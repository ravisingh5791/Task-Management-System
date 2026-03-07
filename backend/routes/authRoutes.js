const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, validateRequest(updateProfileSchema), updateProfile);
router.put('/change-password', authMiddleware, validateRequest(changePasswordSchema), changePassword);

module.exports = router;