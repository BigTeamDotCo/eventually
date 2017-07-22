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

  getCurrentAction(cb) {
    this.Action
      .find({})
      .sort({ date: 'asc' })
      .exec(cb);
  }

  createNewAction(actionData) {
    (new this.Action({
      date: actionData.date,
      action: actionData.name,
      priority: 'Medium'
    })).save(function (err, action) {
    });
  }
}

exports.ConnectorMongoose = ConnectorMongoose;
