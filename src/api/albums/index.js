// api/albums/index.js
const routes = require('../albums/routes');
const handler = require('../albums/handler');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server) => {
    server.route(routes(handler));
  },
};
