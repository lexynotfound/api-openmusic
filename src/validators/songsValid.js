const Joi = require('joi');

const songSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.string().required(),
    performer: Joi.string().required(),
    genre: Joi.string().required(),
    duration: Joi.string().required(),
    albumId: Joi.string().required()
});

module.exports = songSchema;