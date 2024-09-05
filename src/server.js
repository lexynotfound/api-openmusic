const Hapi = require('@hapi/hapi');
const albumsPlugin = require('./api/albums/index');
const songsPlugin = require('./api/songs/index');
require('dotenv').config();

const init = async() => {
    const server = Hapi.server({
        port: process.env.PORT || 5000,
        host: process.env.HOST || 'localhost'
    });

    // register plugin
    // await server.register([albumsPlugin, songsPlugin]);
    await server.register(albumsPlugin);
    await server.register(songsPlugin);

    await server.start();

    await server.start();
    console.log(`server running on ${server.info.uri}`);
};

process.on('unhandleRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();