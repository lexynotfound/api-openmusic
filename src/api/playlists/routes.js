const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.addPlaylist,
    options: {
      auth: 'jwt',  // Add JWT authentication to protect the route
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylists,
    options: {
      auth: 'jwt',  // Add JWT authentication
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: handler.addSongToPlaylist,
    options: {
      auth: 'jwt',  // Add JWT authentication
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: handler.getPlaylistSongs,
    options: {
      auth: 'jwt',  // Add JWT authentication
    },
  },
];

module.exports = routes;
