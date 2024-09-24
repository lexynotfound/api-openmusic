const routes = ( handler ) => [
    {
        method: 'POST',
        path: '/authentications',
        handler: handler.login,
        options: {
            auth: false,  // Disable authentication for login route
        },
    },
    {
        method: 'PUT',
        path: '/authentications',
        handler: handler.refreshToken,
    },
    {
        method: 'DELETE',
        path: '/authentications',
        handler: handler.logout,
    },
    
];

module.exports = routes