const Joi = require('joi');

const aiTaskAssistSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().allow('').max(4000).default(''),
  goal: Joi.string().allow('').max(200).default(''),
});

module.exports = { aiTaskAssistSchema };