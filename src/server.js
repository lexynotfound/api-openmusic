const Hapi = require('@hapi/hapi');
const albumsPlugin = require('./api/albums/index'); // Albums plugin
const songsPlugin = require('./api/songs/index.js');   // Songs plugin (assuming it's similarly structured)
const usersPlugin = require('./api/users/index.js'); 
const authPlugin = require('./api/auth/index.js'); 
const playlistPlugin = require('./api/playlists/index.js'); 
const AlbumsService = require('./services/AlbumsServices.js'); // Correct import
const UsersService = require('./services/UsersServices.js'); // Correct import
const PlaylistsService = require('./services/PlaylistsServices.js'); // Correct import
const AuthService = require('./services/AuthServices'); // Correct import
const albumSchema = require('./validators/albumsValid'); // Import validator
const usersSchema = require('./validators/usersValid'); // Import validator
const loginSchema = require('./validators/loginValid'); // Import validator
const playlistSchema = require('./validators/playlistValid');
require('dotenv').config(); // Load environment variables

const init = async () => {
  // Create a new Hapi server
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
      timeout: {
        server: 30000,  // Set server timeout to 30 seconds
        socket: false,
      },
    },
  });

  // Register the albums plugin with correct options
  await server.register({
    plugin: albumsPlugin,
    options: {
      service: new AlbumsService(), // Pass an instance of AlbumsService
      validator: albumSchema, // Pass the validator schema
    },
  });

  // Register the songs plugin
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
    method: '*', // Matches any HTTP method
    path: '/{any*}', // Wildcard path to catch all unmatched routes
    handler: (request, res) => {
      return res.response({
        status: 'fail',
        message: 'Resource not found'
      }).code(404);
    },
  });

  // Add response event logging with enhanced error handling
  server.events.on('response', (request) => {
    try {
      if (request.response && request.response.isBoom) {
        console.error(`Error response for ${request.method.toUpperCase()} ${request.path}:`, request.response.output.payload);
      } else if (request.response && request.response.statusCode) {
        console.log(`${request.info.remoteAddress} - ${request.method.toUpperCase()} ${request.path} --> ${request.response.statusCode}`);
      } else {
        console.log(`Request to ${request.method.toUpperCase()} ${request.path} did not return a valid response`);
      }
    } catch (err) {
      console.error('Error logging response:', err);
    }
  });

  // Add request event logging for error handling
  server.events.on('request', (request, event, tags) => {
    if (tags.error) {
      console.error(`Request ${request.id} error: ${event.error ? event.error.message : 'unknown'}`);
    }
  });

  // Add response event logging with error handling
server.events.on('response', (request) => {
    if (request.response && request.response.statusCode) {
        console.log(`${request.info.remoteAddress} - ${request.method.toUpperCase()} ${request.path} --> ${request.response.statusCode}`);
    } else {
        console.log(`Request to ${request.method.toUpperCase()} ${request.path} did not return a valid response`);
    }
});

// Add request event logging for error handling
server.events.on('request', (request, event, tags) => {
    if (tags.error) {
        console.log(`Request ${request.id} error: ${event.error ? event.error.message : 'unknown'}`);
    }
});


  // Start the server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

// Initialize the server
init();
