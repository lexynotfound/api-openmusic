// src/handlers/usersHandler.js
class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind functions to ensure the correct `this` context
    this.addUser = this.addUser.bind(this);
    this.login = this.login.bind(this);
  }

  async addUser(request, h) {
    const { error, value } = this._validator.validate(request.payload);
    if (error) {
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const { username, password, fullname } = value;
      const userId = await this._service.addUser({ username, password, fullname });
      return h.response({ status: 'success', data: { userId } }).code(201);
    } catch (err) {
      if (err.message.includes('Username already taken')) {
        return h.response({ status: 'fail', message: err.message }).code(400);
      }
      return h.response({ status: 'error', message: 'Internal Server Error' }).code(500);
    }
  }

  async login(request, h) {
    const { error, value } = this._validator.validate(request.payload, { allowUnknown: true, stripUnknown: true });
    if (error) {
      return h.response({ status: 'fail', message: error.details[0].message }).code(400);
    }

    try {
      const userId = await this._service.verifyUserCredential(value);
      const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });
      const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY);
      return h.response({ status: 'success', data: { accessToken, refreshToken } }).code(201);
    } catch (err) {
      return h.response({ status: 'fail', message: 'Invalid credentials' }).code(401);
    }
  }
}

module.exports = UsersHandler;
