const routes = ( handler ) => [
    {
        method: 'POST',
        path: '/users',
        handler: handler.addUser
    },
    {
        method: 'POST',
        path: '/authentications',
        handler: handler.login
    }
    
];

module.exports = routes