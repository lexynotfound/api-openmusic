const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');  // Import @hapi/jwt
const albumsPlugin = require('./api/albums/index'); // Albums plugin
const songsPlugin = require('./api/songs/index.js');   // Songs plugin
const usersPlugin = require('./api/users/index.js'); 
const collabPlugin = require('./api/collabs/index.js'); 
const authPlugin = require('./api/auth/index.js'); 
const playlistPlugin = require('./api/playlists/index.js'); 
const AlbumsService = require('./services/AlbumsServices.js'); 
const UsersService = require('./services/UsersServices.js'); 
const CollabService = require('./services/CollabServices.js'); 
const PlaylistsService = require('./services/PlaylistsServices.js'); 
const AuthService = require('./services/AuthServices'); 
const albumSchema = require('./validators/albumsValid');
const usersSchema = require('./validators/usersValid');
const loginSchema = require('./validators/loginValid');
const collaborationSchema = require('./validators/collabValid');
const playlistSchema = require('./validators/playlistValid');
require('dotenv').config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register JWT plugin
  await server.register(Jwt);

  // Define JWT Authentication strategy
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,  // Secret key for signing the JWT
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600,  // 1 hour expiration
    },
    validate: (artifacts, request, h) => {
      return {
        isValid: true,  // You can add custom validation logic here
        credentials: { userId: artifacts.decoded.payload.userId },  // Attach user ID to credentials
      };
    },
  });

  // Set the default authentication strategy
  server.auth.default('jwt');

  // Register other plugins
  await server.register({
    plugin: albumsPlugin,
    options: {
      service: new AlbumsService(),
      validator: albumSchema,
    },
  });

  await server.register(songsPlugin);
  await server.register({
    plugin: usersPlugin,
    options: {
      service: new UsersService(),
      validator: usersSchema,
    },
  });

  await server.register({
    plugin: authPlugin,
    options: {
      service: new AuthService(),
      validator: loginSchema,
    },
  });

  await server.register({
    plugin: playlistPlugin,
    options: {
      service: new PlaylistsService(),
      validator: playlistSchema,
    },
  });

  await server.register({
    plugin: collabPlugin,  // Register the collaboration plugin
    options: {
      service: new CollabService(),
      validator: collaborationSchema,  // Pass the correct schema here
    },
  });



  // Simple root endpoint
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response({
        message: 'Welcome to OpenMusic API',
        creator: 'Lexyotfound',
        source: 'https://github.com/lexynotfound'
      }).code(200);
    },
  });

  // Catch-all route for handling 404 errors
  server.route({
    method: '*',
    path: '/{any*}',
    handler: (request, res) => {
      return res.response({
        status: 'fail',
        message: 'Resource not found'
      }).code(404);
    },
  });

  // Start the server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
