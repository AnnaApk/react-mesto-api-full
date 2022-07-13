module.exports = class UnAuthError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
};
