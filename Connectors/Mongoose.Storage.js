const mongoose = require('mongoose');
const path = require('path');
const EventEmitter = require('events');

module.exports = class ConnectorMongoose {
  getCurrentAction(availableActions) {
    return this.awaitDatabase().then(() => {
      return this.Action.find({
        action: { $in: availableActions }
      }).sort({ date: 'asc' });
    });
  }

  createNewAction(actionData) {
    return new Promise((resolve, reject) => {
      (new this.Action({
        appId: actionData.appId,
        date: actionData.date,
        action: actionData.action,
        actionState: actionData.actionState,
        priority: actionData.priority || 'Medium'
      })).save();
    });
  }

  removeActionById(actionId) {
    return new Promise((resolve, reject) => {
      this.Action.remove({
        _id: actionId
      }, function (err, action) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  awaitDatabase() {
    return new Promise((resolve) => {
        if (this.databaseAvailable) {
            resolve();
        } else {
            this.emitter.once('databaseAvailable', () => {
                resolve();
            });
        }
    });
  }

  removeAction(appId, action) {
    return this.awaitDatabase().then(() => {
      return this.Action.remove({
        appId: appId,
        action: action
      });
    });
  }

  updateAction(appId, actionName, data) {
    return this.awaitDatabase().then(() => {
      return this.Action.update({
        appId: appId,
        action: actionName
      }, { $set: { actionState: data } });
    });
  }

  constructor(options) {
    this.options = options;
    this.host = options.host ? options.host : '127.0.0.1';
    this.port = options.port ? options.port : '27017';
    this.dbName = options.dbName ? options.dbName : 'eventually';
    this.credentials = options.user
      ? `${options.user}${options.password ? ':' + options.password : '' }@`
      : '';
    this.connectionString = options.connectionString
        ? options.connectionString
        : `mongodb://${this.credentials}${this.host}:${this.port}/${this.dbName}`;
    this.debug = typeof options.debug !== 'undefined' ? options.debug : false;
    this.db = null;
    this.emitter = new EventEmitter();
    this.awaitDatabase = this.awaitDatabase.bind(this);
    this.emitter.once('databaseAvailable', () => {
        this.databaseAvailable = true;
        this._includeModels();
        this._getModels();
    });
    this._setupMongooseConnections();
  }

  _openConnection(uri) {
    return mongoose.connect(uri, {
      user: this.options.user,
      pass: this.options.pass,
      dbName: this.dbName,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
  }

  _setupMongooseConnections() {
    mongoose.Promise = global.Promise;
    this.db = this._openConnection(this.connectionString);
    if (this.db.once) {
        this.db.once('open', this._mongooseOpened.bind(this));
        this.db.on('disconnected', this._mongooseDisconnected.bind(this));
        this.db.on('error', this._mongooseError.bind(this));
    } else {
        this.db.then(what => {
            this.emitter.emit('databaseAvailable');
        }).catch(e => {
            console.error(e);
        });
    }
  }

  _mongooseError(error) {
    console.log('Mongoose threw an error', error);
    this.db = this._openConnection(this.connectionString);
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
     this.db = this._openConnection(this.connectionString);
  }

  _includeModels() {
    require(path.resolve(`${__dirname}/MongooseModels/action-error.model`));
    require(path.resolve(`${__dirname}/MongooseModels/task.model`));
    require(path.resolve(`${__dirname}/MongooseModels/history.model`));
  }

  _getModels() {
    this.Action = mongoose.model('Action');
    this.History = mongoose.model('History');
    this.ActionError = mongoose.model('ActionError');
  }
}
