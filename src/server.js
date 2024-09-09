// src/server.js
const Hapi = require('@hapi/hapi');
const albumsPlugin = require('./api/albums/index.js');
const songsPlugin = require('./api/songs/index.js');
require('dotenv').config();

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
  });

await server.register(albumsPlugin);
await server.register(songsPlugin);

  // Simple root endpoint
  server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    console.log('Root endpoint was accessed');
    return h.response({ message: 'Welcome to OpenMusic API', create: 'Lexyotfound', source: 'github.com/lexynotfound' }).code(200);
  },
});


  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();