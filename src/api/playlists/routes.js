const routes = ( handler ) => [
    {
        method: 'POST',
        path: '/playlists',
        handler:  handler.addPlaylist,
    },
    {
        method: 'GET',
        path: '/playlists',
        handler:  handler.getPlaylists,
    },
    {
        method: 'POST',
        path: '/playlists/{playlistId}/songs',
        handler:  handler.addSongToPlaylist,
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/songs',
        handler:  handler.getPlaylistSongs,
    },
    
];

module.exports = routes