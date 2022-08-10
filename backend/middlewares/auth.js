const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');

const throwUnauthorizedError = () => {
  const err = new Error('Авторизуйтесь для доступа');
  err.statusCode = 401;
  throw err;
};

const isAuthorized = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) {
    throwUnauthorizedError();
  }

  const token = auth.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (e) {
    throwUnauthorizedError();
  }
  req.user = payload;
  next();

  // try {
  //   const payload = jwt.verify(token, SECRET_KEY);
  //   User.findOne({ _id: payload._id })
  //     .then((user) => {
  //       if (!user) {
  //         throwUnauthorizedError();
  //       }
  //       req.user = { _id: user._id };
  //       next();
  //     })
  //     .catch(next);
  // } catch (err) { throwUnauthorizedError(); }
};

module.exports = { isAuthorized };
