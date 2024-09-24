// src/api/albums/index.js
const AuthHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'auth',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    // Ensure service and validator are correctly used
    const authHandler = new AuthHandler(service, validator);
    server.route(routes(authHandler));
  },
};
