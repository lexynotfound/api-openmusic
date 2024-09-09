const routes = require('../songs/routes');
const handler = require('../songs/handler');

module.exports = {
    name: 'songs',
    version: '1.0.0',
    register: async (server) => {
        server.route(routes(handler));
    },
};
