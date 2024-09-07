// server.js
const Hapi = require('@hapi/hapi');
const albumsRoutes = require('./api/albums/routes');
const songsRoutes = require('./api/songs/routes');
require('dotenv').config();

const init = async () => {
    try {
        const server = Hapi.server({
            port: process.env.PORT || 5000,
            host: process.env.HOST || 'localhost',
        });

        // Directly register routes
        server.route([...albumsRoutes, ...songsRoutes]);

        await server.start();
        console.log(`Server running on ${server.info.uri}`);
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    process.exit(1);
});

init();
