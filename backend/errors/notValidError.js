module.exports = class NotValidError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
};
