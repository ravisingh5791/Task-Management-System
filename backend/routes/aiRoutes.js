const express = require('express');
const { taskAssist } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { aiTaskAssistSchema } = require('../validators/aiValidators');

const router = express.Router();

router.use(authMiddleware);
router.post('/task-assist', validateRequest(aiTaskAssistSchema), taskAssist);

module.exports = router;