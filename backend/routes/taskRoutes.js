const express = require('express');
const {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  toggleArchiveTask,
  deleteTask,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidators');

const router = express.Router();

router.use(authMiddleware);

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', validateRequest(createTaskSchema), createTask);
router.put('/:id', validateRequest(updateTaskSchema), updateTask);
router.patch('/:id/archive', toggleArchiveTask);
router.delete('/:id', deleteTask);

module.exports = router;