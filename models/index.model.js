const mongoose = require('mongoose');
const path = require('path');

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
    require(path.resolve(`${__dirname}/task.model`));
    require(path.resolve(`${__dirname}/history.model`));
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
      appId: actionData.appId,
      date: actionData.date,
      action: actionData.action,
      actionState: actionData.actionState,
      priority: 'Medium'
    })).save(cb);
  }

  removeActionById(actionId, cb) {
    this.Action.remove({
      _id: actionId
    }, function (err, action) {
      console.log('delete ' + new Date());
      cb(err);
    });
  }

  removeAction(appId, action, cb) {
    this.Action.remove({
      appId: appId,
      action: action
    }, function (err) {
      console.log('remove action ' + action);
      if (cb) {
        cb();
      }
    });
  }

  updateAction(appId, actionName, data, cb) {
    this.Action.update({
      appId: appId,
      action: actionName
    }, { $set: { actionState: data } }).exec(
      (error, action) => {
        cb(error);
      });
  }
}

exports.ConnectorMongoose = ConnectorMongoose;
