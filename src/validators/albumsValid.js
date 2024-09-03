const Joi = require('joi');

const albumSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().required(),
});

module.exports = albumSchema;