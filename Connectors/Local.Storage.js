const path = require('path');
const fs = require('fs');
const mkPathFromRoot = require('../utilities/mkPathFromRoot');
const enums = require('../enums/priority.enum');
const Action = require('./LocalStorageModels/Action.Model')
const _S_ = path.sep;

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

  /**
   * __d__ - date
   * __ai__ - external app id
   * __ac__ - action name
   */
  get fileParseRegExp() { return this._fileParseRegExp; }
  set fileParseRegExp(value) { this._fileParseRegExp = value; }

  getCurrentAction(availableActions) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this._getHighestPriorityItem());
      } catch (e) {
        reject(e);
      }
    });
  }

  createNewAction(actionData) {
    return new Promise((resolve, reject) => {
      const fileName = this._createFilename(actionData);
      fs.createWriteStream(`${this.localStoragePath}${_S_}${enums.HIGH}${_S_}${fileName}`)
        .write(JSON.stringify(actionData))
        .on('finish', () => {
          resolve();
        });
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
   * Updates the action by Id and action name
   * @param String appId
   * @param String actionName
   * @param {*} data
   * @param function cb
   */
  updateAction(appId, actionName, data) {
  }

  constructor(options) {
    mkPathFromRoot(options.moduleRoot, `.localStorage${_S_}${enums.LOW}`);
    mkPathFromRoot(options.moduleRoot, `.localStorage${_S_}${enums.MEDIUM}`);
    mkPathFromRoot(options.moduleRoot, `.localStorage${_S_}${enums.HIGH}`);
    this.localStoragePath = path.resolve(`${options.moduleRoot}${_S_}.localStorage`);
    this.fileParseRegExp = new RegExp('__d__(.*)(?=__ai__)__ai__(.*)(?=__ac__)__ac__(.*)$');
  }

  /**
   * reads dir and parse file name
   */
  _getFileList(priority) {
    return fs.readdirSync(this.localStoragePath + _S_ + priority)
      .map(fileName => this._parseFilename(fileName));
  }

  /**
   * Get highest priority next item
   */
  _getNextItemInList([fileName, ...listFileName]) {
    return listFileName.reduce((fileData, check) => {
      if (fileData.date > check.date) {
        return fileData;
      } else {
        return check;
      }
    }, fileName);
  }

  /**
   * Get highest priority next item
   */
  _getHighestPriorityItem() {
    return [enums.HIGH, enums.MEDIUM, enums.LOW].map(priority => {
      const listFileName = this._getFileList(priority);
      if (listFileName.length > 0) {
        return this._getNextItemInList(listFileName);
      }
      return undefined;
    }).reduce((pre, curr) => {
      if (typeof curr === undefined) return pre;
      if (typeof pre === undefined) return curr;
      return pre.date < curr.date ? pre : curr;
    }, undefined);
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
    return `__d__${date}__ai__${appId}__ac__${action}`;
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
