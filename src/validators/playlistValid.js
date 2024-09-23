// src/validators/playlistsValid.js
const Joi = require('joi');

const playlistSchema = Joi.object({
  name: Joi.string().required(),
});

const songToPlaylistSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { playlistSchema, songToPlaylistSchema };
