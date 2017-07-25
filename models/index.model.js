const mongoose = require('mongoose');

class ConnectorMongoose {
  constructor(options) {
    const host = options.host ? options.host : '127.0.0.1';
    const port = options.port ? options.port : '27017';
    const dbName = options.dbName ? options.dbName : 'node-aot';
    const credentials = options.user
      ? `${options.user}${options.password ? ':' + options.password : '' }@`
      : '';
    mongoose.connect(`mongodb://${credentials}${host}:${port}/${dbName}`, { useMongoClient: true });
    this._includeModels();
    this._getModels();
  }

  _includeModels() {
    require('./task.model');
    require('./history.model');
  }

  _getModels() {
    this.Action = mongoose.model('Action');
    this.History = mongoose.model('History');
  }

  getCurrentAction(availableActions, cb) {
    this.Action
      .find({
        action: { $in: availableActions}
      })
      .sort({ date: 'asc' })
      .exec((err, actions) => {
        cb(err, actions[0])
      });
  }

  createNewAction(actionData, cb) {
    (new this.Action({
      date: actionData.date,
      action: actionData.action,
      priority: 'Medium'
    })).save(cb);
  }

  removeAction(actionId, cb) {
    this.Action.remove({
      _id: actionId
    }, function (err, action) {
      cb(err);
    });
  }
}

exports.ConnectorMongoose = ConnectorMongoose;
