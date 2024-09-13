// src/api/albums/routes.js
const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.addAlbum,
  },
  {
    method: 'GET',
    path: '/albums',
    handler: handler.getAlbums,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumById,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.updateAlbumById,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumById,
  },
];

module.exports = routes;
