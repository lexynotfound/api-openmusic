const routes = ( handler ) => [
    {
        method: 'POST',
        path: '/users',
        handler: handler.addUser
    },
    {
    method: 'GET',
    path: '/users/{id}',
    handler: handler.getUserById,
    }
    
];

module.exports = routes;