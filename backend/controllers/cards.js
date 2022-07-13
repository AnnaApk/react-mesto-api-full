const { ObjectId } = require('mongoose').Types;
const NotValidError = require('../errors/notValidError');
const ForbiddenError = require('../errors/forbiddenError');
const NotFoundError = require('../errors/notFoundError');

const Card = require('../models/card');

module.exports.postCard = (req, res, next) => {
  const owner = req.user._id;
  const { name, link, createdAt } = req.body;

  Card.create({
    name, link, owner, createdAt,
  })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NotValidError('Данные карточки не верны!');
      }
      throw err;
    })
    .catch(next);
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(next);
};

module.exports.deleteCardById = (req, res, next) => {
  const { id } = req.params;

  Card.findById(id)
    .orFail(() => new NotFoundError('Карточка не найдена!'))
    .then((card) => {
      if (card.owner.toString() !== req.user._id.toString()) {
        throw new ForbiddenError('Карточка не Ваша!');
      }
      return card.remove()
        .then(() => res.status(200).send(card));
    })
    .catch(next);
};

module.exports.addLike = (req, res, next) => {
  const user = req.user._id;
  const card = req.params.cardId;
  Card.findByIdAndUpdate(
    card,
    { $addToSet: { likes: user } },
    { new: true },
  )
    .then((patchedCard) => {
      if (!patchedCard) {
        throw new NotFoundError('Карточка не найдена!');
      }
      res.send(patchedCard);
    })
    .catch((err) => {
      if (!ObjectId.isValid(req.params.cardId)) {
        throw new NotValidError('Данные не верны!');
      }
      throw (err);
    })
    .catch(next);
};

module.exports.deleteLike = (req, res, next) => {
  const user = req.user._id;
  const card = req.params.cardId;

  Card.findByIdAndUpdate(
    card,
    { $pull: { likes: user } },
    { new: true },
  )
    .then((patchedCard) => {
      if (!patchedCard) {
        throw new NotFoundError('Карточка не найдена!');
      }
      res.send(patchedCard);
    })
    .catch((err) => {
      if (!ObjectId.isValid(req.params.cardId)) {
        throw new NotValidError('Данные не верны!');
      }
      throw (err);
    })
    .catch(next);
};
