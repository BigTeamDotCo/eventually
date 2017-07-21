const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const actionError = require('./action-error.model').actionError;

const historySchema = new Schema({
  date: Date,
  action: String,
  priority: {
    type: String
  },
  errorList: [ actionError ]
});

const History = mongoose.model('History', historySchema);
