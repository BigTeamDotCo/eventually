const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const actionError = require('./action-error.model').actionError;
const PRIORITY = require('../priority.enum');

const actionSchema = new Schema({
  date: Date,
  deadline: Date,
  action: String,
  priority: {
    type: String
    enum: PRIORITY
  },
  errorList: [ actionError ]
});

const Action = mongoose.model('Action', actionSchema);
