const path = require('path');
const fs = require('fs');
const mkPathFromRoot = require('../utilities/mkPathFromRoot');
const enums = require('../enums/priority.enum');
const Action = require('./LocalStorageModels/Action.Model')

module.exports = class LocalStorage {
  /**
   * @return @var LocalStorageModels.ActionModel;
   */
  get action() { return this._actionModelInstance; }
  set action(value) { this._actionModelInstance = value; }

  /**
   * @property @var path where local storage stores files with actions
   */
  get localStoragePath() { return this._localStoragePath; }
  set localStoragePath(value) { this._localStoragePath = value; }

  getCurrentAction(availableActions) {
    return new Promise((resolve, reject) => {
      try {
        const s = path.sep;
        const fileNameList = fs.readdirSync(`${this.localStoragePath}${s}${enums.HIGH}`)
          .map(fileName => this._parseFilename(fileName));
      } catch (e) {
        cb(e);
      }
    });
  }

  createNewAction(actionData) {
    return new Promise((resolve, reject) => {

    });
  }

  removeAction(appId, action) {
    return new Promise((resolve, reject) => {

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

  /**
   * Updates the
   * @param String appId
   * @param String actionName
   * @param {*} data
   * @param function cb
   */
  updateAction(appId, actionName, data) {
  }

  constructor(options) {
    mkPathFromRoot(options.moduleRoot, `.localStorage${path.sep}${enums.LOW}`);
    mkPathFromRoot(options.moduleRoot, `.localStorage${path.sep}${enums.MEDIUM}`);
    mkPathFromRoot(options.moduleRoot, `.localStorage${path.sep}${enums.HIGH}`);
    this.localStoragePath = path.resolve(`${options.moduleRoot}${path.sep}.localStorage`);
    this.fileParseRegExp = new RegExp('__d__(.*)(?=__ai__)__ai__(.*)(?=__dd__)__dd__(.*)(?=__ac__)__ac__(.*)$');
  }

  /**
   * Create Filename For Storage
   * @param LocalStorageModels.ActionModel
   */
  _createFilename(actionModel) {
    const date = actionModel.date.getTime();
    const appId = actionModel.appId.toString();
    const deadline = actionModel.deadline.getTime();
    const action = actionModel.action;
    if (!date && !appId && !deadline && !action) {
      throw new Error('Invalid action config provided');
    }
    return `__d__${date}__ai__${appId}__dd__${deadline}__ac__${action}`;
  }

  /**
   * Parse Filename From LocalStorage
   * @param String
   */
  _parseFilename(filePath) {
    if (!this.fileParseRegExp.test(filePath)) throw new Error('Filename is not parsable');
    const
    return {
      date: new Date(fileNameArray[1]),
      appId: fileNameArray[2],
      deadline: new Date(fileNameArray[3]),
      action: new Date(fileNameArray[4]),
    };
  }
}
