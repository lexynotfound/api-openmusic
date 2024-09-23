// src/validators/usersValid.js
const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password does not match', // This will now work correctly
  }),
  fullname: Joi.string().required(),
});

module.exports = userSchema;
