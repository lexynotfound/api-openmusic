const routes = require('./routes');
const handler = require('./handler');

module.exports = {
    name: 'albums',
    version: '1.0.0',
    register: async (server) => {
        server.route(routes(handler));
    },
};