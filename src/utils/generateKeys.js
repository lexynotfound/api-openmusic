const crypto = require('crypto');

// menghasilkan crypto

const accessTokenKey = crypto.randomBytes(32).toString('base64');
const refreshTokenKey = crypto.randomBytes(32).toString('base64');

console.log('Access Token : ', accessTokenKey);
console.log('Refresh Token : ', refreshTokenKey);