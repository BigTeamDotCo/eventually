const mongoose = require('mongoose');
const path = require('path');
mongoose.Promise = global.Promise;

class ConnectorMongoose {
  constructor(options) {
    this.options = options;
    this.host = options.host ? options.host : '127.0.0.1';
    this.port = options.port ? options.port : '27017';
    this.dbName = options.dbName ? options.dbName : 'eventually';
    this.credentials = options.user
      ? `${options.user}${options.password ? ':' + options.password : '' }@`
      : '';
    this.debug = typeof options.debug !== 'undefined' ? options.debug : false;
    this.db = null;
    this._setupMongooseConnections();
    this._includeModels();
    this._getModels();
  }

  _openConnection(uri) {
    return mongoose.connect(uri, {
      useMongoClient: true,
      socketTimeoutMS: 1000,
      connectTimeoutMS: 1000
    });
  }

  _setupMongooseConnections() {
    this.db = this._openConnection(`mongodb://${this.credentials}${this.host}:${this.port}/${this.dbName}`);
    this.db.once('open', this._mongooseOpened.bind(this));
    this.db.on('disconnected', this._mongooseDisconnected.bind(this));
    this.db.on('error', this._mongooseError.bind(this));
  }

  _mongooseError(error) {
    console.log('Mongoose threw an error', error);
    this.db = this._openConnection(`mongodb://${this.credentials}${this.host}:${this.port}/${this.dbName}`);
  }

  _mongooseOpened(error) {
    if (error) {
      console.error('Could not connect to MongoDB!', error);
    } else {
      mongoose.set('debug', this.debug);
    }
  }

  _mongooseDisconnected() {
     console.log('Mongo disconnected.')
     mongoose.set('debug', null);
     this.db = this._openConnection(`mongodb://${this.credentials}${this.host}:${this.port}/${this.dbName}`);
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
