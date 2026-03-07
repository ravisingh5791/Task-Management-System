const Joi = require('joi');

const statusValues = ['pending', 'in-progress', 'completed'];
const priorityValues = ['low', 'medium', 'high'];

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().allow('').max(4000).default(''),
  status: Joi.string().valid(...statusValues).default('pending'),
  priority: Joi.string().valid(...priorityValues).default('medium'),
  dueDate: Joi.date().iso().allow(null),
  tags: Joi.array().items(Joi.string().trim().min(1).max(30)).max(10).default([]),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120),
  description: Joi.string().allow('').max(4000),
  status: Joi.string().valid(...statusValues),
  priority: Joi.string().valid(...priorityValues),
  dueDate: Joi.date().iso().allow(null),
  tags: Joi.array().items(Joi.string().trim().min(1).max(30)).max(10),
  isArchived: Joi.boolean(),
}).min(1);

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};