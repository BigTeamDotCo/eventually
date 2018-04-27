const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionError = new Schema({
  message: String
});

const ActionError = mongoose.model('ActionError', actionError, { timestamps: true });

module.exports = actionError;
