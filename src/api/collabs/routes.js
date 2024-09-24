const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.addCollaboration,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaboration,
    options: {
      auth: 'jwt', // Requires authentication
    },
  },
];

module.exports = routes;
