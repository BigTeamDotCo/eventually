const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionError = new Schema({
  message: String
}, { timestamps: true });

const ActionError = mongoose.model('ActionError', actionError);

module.exports = actionError;
