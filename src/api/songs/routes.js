module.exports = (handler) => [
    {
        method: 'POST',
        path: '/songs',
        handler: handler.addSong,
    },
    {
        method: 'GET',
        path: '/songs',
        handler: handler.getSongs,
    },
    {
        method: 'GET',
        path: '/songs/{id}',
        handler: handler.getSongById,
    },
    {
        method: 'PUT',
        path: '/songs/{id}',
        handler: handler.updateSongById,
    },
    {
        method: 'DELETE',
        path: '/songs/{id}',
        handler: handler.deleteSongById,
    }
];