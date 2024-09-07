const Hapi = require('@hapi/hapi');
const albumsPlugin = require('./api/albums/index');
const songsPlugin = require('./api/songs/index');
require('dotenv').config();

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost',
        routes: {
            cors: true, // Enable CORS for broader access
        }
    });

    // Register plugins
    try {
        await server.register(albumsPlugin);
        await server.register(songsPlugin);
        console.log('Plugins registered successfully.');
    } catch (err) {
        console.error('Error registering plugins:', err);
        process.exit(1);
    }

    // Log incoming requests
    server.ext('onRequest', (request, h) => {
        console.log(`Incoming Request: ${request.method.toUpperCase()} ${request.path}`);
        return h.continue;
    });

    // Log detailed errors
    server.events.on('request', (request, event, tags) => {
        if (tags.error) {
            const errorDetails = event.error || { message: 'No error details available', stack: 'No stack trace available' };
            console.log(`Error on ${request.method.toUpperCase()} ${request.path}: ${errorDetails.message}`);
            if (errorDetails.stack) {
                console.log(errorDetails.stack);
            }
        }
    });

    // Log responses
    server.events.on('response', (request) => {
        const { method, path, response } = request;
        const statusCode = response && response.statusCode ? response.statusCode : 'No response';
        console.log(`Response: ${method.toUpperCase()} ${path} --> Status: ${statusCode}`);
    });

    // Add a simple test route to verify server response
    server.route({
        method: 'GET',
        path: '/ping',
        handler: (request, h) => {
            return h.response({ status: 'success', message: 'pong' }).code(200);
        },
    });

    // Start server
    try {
        await server.start();
        console.log(`Server running on ${server.info.uri}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    process.exit(1);
});

init();
