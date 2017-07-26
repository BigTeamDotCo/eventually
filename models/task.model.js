const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const actionError = require('./action-error.model').actionError;
const PRIORITY = require('../enums/priority.enum').PRIORITY;

const actionSchema = new Schema({
  appId: Schema.Types.ObjectId,
  date: Date,
  deadline: Date,
  action: String,
  actionState: Schema.Types.Mixed,
  priority: {
    type: String,
    enum: PRIORITY
  },
  errorList: [ actionError ]
});

const Action = mongoose.model('Action', actionSchema);
