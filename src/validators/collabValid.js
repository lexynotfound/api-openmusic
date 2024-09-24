const Joi = require('joi');

// Collaboration validation schema
const collaborationSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { collaborationSchema };
