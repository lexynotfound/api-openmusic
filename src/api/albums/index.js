// api/albums/index.js
const routes = require('./routes'); // Ensure this is a function returning an array
const handler = require('./handler');

module.exports = {
    name: 'albums',
    version: '1.0.0',
    register: async (server) => {
        server.route(routes(handler)); // Assuming routes is a function returning an array
    },
};
