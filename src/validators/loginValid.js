// src/validators/loginValid.js
const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Username is required',
    'string.base': 'Username must be a string',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
    'string.base': 'Password must be a string',
  }),
});

module.exports = loginSchema;
