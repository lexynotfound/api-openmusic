// api/songs/routes.js
const handler = require('./handler');

const routes = [
  { method: 'POST', path: '/songs', handler: handler.addSong },
  { method: 'GET', path: '/songs', handler: handler.getSongs },
  { method: 'GET', path: '/songs/{id}', handler: handler.getSongById },
  { method: 'PUT', path: '/songs/{id}', handler: handler.updateSongById },
  { method: 'DELETE', path: '/songs/{id}', handler: handler.deleteSongById },
];

module.exports = routes;
