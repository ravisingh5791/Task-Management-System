const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const parseTags = (tags) => {
  if (!tags) return [];
  return tags.map((tag) => tag.toLowerCase().trim()).filter(Boolean);
};

const markCompletedAt = (task) => {
  if (task.status === 'completed' && !task.completedAt) {
    task.completedAt = new Date();
  }

  if (task.status !== 'completed') {
    task.completedAt = null;
  }
};

const getTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status,
    priority,
    sortBy = 'created_at_desc',
    isArchived = 'false',
  } = req.query;

  const query = {
    user: req.user.id,
    isArchived: isArchived === 'true',
  };

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { tags: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const sortMap = {
    created_at_desc: { created_at: -1 },
    created_at_asc: { created_at: 1 },
    dueDate_asc: { dueDate: 1, created_at: -1 },
    dueDate_desc: { dueDate: -1, created_at: -1 },
    priority_desc: { priority: -1, created_at: -1 },
  };

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10));

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort(sortMap[sortBy] || sortMap.created_at_desc)
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    tasks,
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
      hasNextPage: safePage * safeLimit < total,
      hasPrevPage: safePage > 1,
    },
  });
});

const getTaskStats = asyncHandler(async (req, res) => {
  const userQuery = { user: req.user.id, isArchived: false };
  const today = new Date();

  const [total, pending, inProgress, completed, highPriority, overdue] = await Promise.all([
    Task.countDocuments(userQuery),
    Task.countDocuments({ ...userQuery, status: 'pending' }),
    Task.countDocuments({ ...userQuery, status: 'in-progress' }),
    Task.countDocuments({ ...userQuery, status: 'completed' }),
    Task.countDocuments({ ...userQuery, priority: 'high' }),
    Task.countDocuments({
      ...userQuery,
      dueDate: { $lt: today },
      status: { $ne: 'completed' },
    }),
  ]);

  res.status(200).json({
    total,
    pending,
    inProgress,
    completed,
    highPriority,
    overdue,
  });
});

const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({
    user: req.user.id,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    dueDate: req.body.dueDate || null,
    tags: parseTags(req.body.tags),
    aiSummary: req.body.aiSummary || '',
  });

  markCompletedAt(task);
  await task.save();

  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  const fields = ['title', 'description', 'status', 'priority', 'isArchived'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  if (req.body.dueDate !== undefined) {
    task.dueDate = req.body.dueDate || null;
  }

  if (req.body.tags !== undefined) {
    task.tags = parseTags(req.body.tags);
  }

  markCompletedAt(task);
  await task.save();

  res.status(200).json(task);
});

const toggleArchiveTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  task.isArchived = !task.isArchived;
  await task.save();

  res.status(200).json({
    message: task.isArchived ? 'Task archived' : 'Task restored',
    task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) {
    throw new AppError(404, 'Task not found');
  }

  res.status(200).json({ message: 'Task deleted successfully' });
});

module.exports = {
  getTasks,
  getTaskStats,
  createTask,
  updateTask,
  toggleArchiveTask,
  deleteTask,
};