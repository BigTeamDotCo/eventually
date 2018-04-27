const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const path = require('path');
const actionError = require(path.resolve(`${__dirname}/action-error.model`)).actionError;

const historySchema = new Schema({
  date: Date,
  action: String,
  priority: {
    type: String
  },
  errorList: [ actionError ]
});

const History = mongoose.model('History', historySchema);
