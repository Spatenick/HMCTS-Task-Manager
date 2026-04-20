const Joi = require('joi');
const { VALID_STATUSES } = require('../models/taskModel');
const { ValidationError } = require('../utils/errors');

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must be 200 characters or fewer',
  }),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  status: Joi.string().valid(...VALID_STATUSES).default('PENDING'),
  dueDate: Joi.string().isoDate().required().messages({
    'string.isoDate': 'dueDate must be a valid ISO 8601 date-time string',
    'any.required': 'dueDate is required',
  }),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(2000).allow('', null).optional(),
  status: Joi.string().valid(...VALID_STATUSES).optional(),
  dueDate: Joi.string().isoDate().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided',
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...VALID_STATUSES).required().messages({
    'any.only': `status must be one of: ${VALID_STATUSES.join(', ')}`,
    'any.required': 'status is required',
  }),
});

/**
 * Express middleware factory. Validates req.body against the provided schema
 * and replaces it with the sanitised, defaults-applied value.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
      return next(new ValidationError('Validation failed', details));
    }
    req.body = value;
    next();
  };
}

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  validate,
};
