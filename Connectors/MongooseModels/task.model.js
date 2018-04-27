const mongoose = require('mongoose');
const path = require('path');
const Schema = mongoose.Schema;
const PRIORITY = require(path.resolve(`${__dirname}/../../enums/priority.enum`)).PRIORITY;

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
  errorList: [{
    type: ObjectId,
    ref: 'ActionError'
  }]
});

const Action = mongoose.model('Action', actionSchema);
