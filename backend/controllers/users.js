const SECRET_KEY = 'very_secret';
const SOLT = 10;

const { ObjectId } = require('mongoose').Types;
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotValidError = require('../errors/notValidError');
const ConflictError = require('../errors/conflictError');
const NotAuthError = require('../errors/unAuthError');
const NotFoundError = require('../errors/notFoundError');

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcryptjs
    .hash(password, SOLT)
    .then((hash) => {
      User
        .create({
          name, about, avatar, email, password: hash,
        })
        .then((user) => {
          const resUser = {
            name: user.name,
            about: user.about,
            avatar: user.avatar,
            email: user.email,
            _id: user._id,
          };
          res.status(200).send({ data: resUser });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new NotValidError('Данные пользователя не верны!');
          }
          if (err.code === 11000) {
            throw new ConflictError('Email уже зарегистрирован!');
          }
          throw err;
        })
        .catch(next);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new NotAuthError('Данные не верны!');
      }
      return Promise.all([
        user,
        bcryptjs.compare(password, user.password),
      ]);
    })
    .then(([user, isPasswordCorrect]) => {
      if (!isPasswordCorrect) {
        throw new NotAuthError('Данные не верны!');
      }
      return jwt.sign({ _id: user._id }, SECRET_KEY, { expiresIn: '7d' });
    })
    .then((token) => res.send({ token }))
    .catch(next);
};

module.exports.authorizedUser = (req, res, next) => {
  const { _id } = req.user;
  User.findOne({ _id })
    .then((user) => {
      const data = {
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
        _id: user._id,
      };
      res.send({ data });
    })
    .catch(next);
};

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден!');
      }
      res.send(user);
    })
    .catch((err) => {
      if (!ObjectId.isValid(req.params.id)) {
        throw new NotValidError('Данные пользователя не верны!');
      }
      throw err;
    })
    .catch(next);
};

module.exports.patchUser = (req, res, next) => {
  const user = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    user,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((patchedUser) => {
      if (!patchedUser) {
        throw new NotAuthError('Пользователь не найден!');
      }
      res.send(patchedUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotValidError('Данные пользователя не верны!');
      }
      throw err;
    })
    .catch(next);
};

module.exports.patchUserAvatar = (req, res, next) => {
  const user = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    user,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((patchedUser) => {
      if (!patchedUser) {
        throw new NotAuthError('Пользователь не найден!');
      }
      res.send(patchedUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotValidError('Данные пользователя не верны!');
      }
      throw err;
    })
    .catch(next);
};
