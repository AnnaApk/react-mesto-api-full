const mongoose = require('mongoose');
const validator = require('validator');

// const REGULAR = /^https?:\/\/[a-z0-9\D]*\.{1}[a-z0-9\D]*/gmi;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    // match: REGULAR,
    validate: {
      validator(v) {
        return validator.isURL(v);
      },
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// создаём модель и экспортируем её
module.exports = mongoose.model('user', userSchema);
