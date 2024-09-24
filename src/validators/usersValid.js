const Joi = require('joi');

const userSchema = Joi.object({
  fullname: Joi.string().required().messages({
    'any.required': 'Fullname is required',
    'string.base': 'Fullname must be a string',
  }),
  username: Joi.string().required().messages({
    'any.required': 'Username is required',
    'string.base': 'Username must be a string',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email format',
    'string.base': 'Email must be a string',
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'string.base': 'Password must be a string',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password does not match password',
    'any.required': 'Confirm password is required',
  }),
});

module.exports = userSchema;
