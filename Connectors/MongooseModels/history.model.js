const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const path = require('path');

const historySchema = new Schema({
  date: Date,
  action: String,
  priority: {
    type: String
  },
  errorList: [ {
      type: Schema.Types.ObjectId,
      ref: 'ActionError'
  } ]
});

const History = mongoose.model('History', historySchema);
