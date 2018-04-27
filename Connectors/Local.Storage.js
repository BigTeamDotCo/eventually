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

  /**
   * Get highest priority next action
   * @returns Promise(@instance /Connectors/LocalStorageModels/ActionModel)
   */
  getCurrentAction(availableActions) {
    return new Promise((resolve, reject) => {
      try {
        resolve(this._getHighestPriorityItem());
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Creates highest priority next action
   * @returns Promise(@instance /Connectors/LocalStorageModels/ActionModel)
   */
  createNewAction(actionData) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = this._createFilename(actionData);
        const action = new Action({ ...actionData, id: enums.HIGH + _S_ + fileName });
        fs.createWriteStream(`${this.localStoragePath}${_S_}${enums.HIGH}${_S_}${fileName}`)
        .write(JSON.stringify(action))
        .on('finish', () => {
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Deletes action file, assumes unique appId
   */
  removeAction(appId, action) {
    return new Promise((resolve, reject) => {
      const fileNameTest = this._createFilenameTest({appId, action});
      const matchingFilePath = [enums.HIGH, enums.MEDIUM, enums.HIGH].reduce((pre, priority) => {
        if (pre) return pre;
        const matchFileName = fs.readdirSync(
          this.localStoragePath+_S_+priority+_S_+fileName).reduce((_, currFileName) => {
            if (_) return _;
            return fileNameTest.test(currFileName) ? currFileName : undefined;
          }, undefined);
          if (matchFileName) return this.localStoragePath+_S_+priority+_S_+matchFileName;
          return undefined;
      }, undefined);
      fs.unlinkSync(matchingFilePath);
      resolve();
    });
  }

  /**
   * Deletes action file, by created action Id
   */
  removeActionById(actionId) {
    return new Promise((resolve, reject) => {
      fs.unlinkSync(this.localStoragePath + _S_ + actionId);
    });
  }

  /**
   * Updates the action by Id and action name
   * @param String appId
   * @param String action
   * @param {*} data
   * @param function cb
   */
  updateAction(appId, action, data) {
    return new Promise((resolve, reject) => {
      const fileNameTest = this._createFilenameTest({appId, action});
      const matchingFilePath = [enums.HIGH, enums.MEDIUM, enums.HIGH].reduce((pre, priority) => {
        if (pre) return pre;
        const matchFileName = fs.readdirSync(
          this.localStoragePath+_S_+priority+_S_+fileName).reduce((_, currFileName) => {
            if (_) return _;
            return fileNameTest.test(currFileName) ? currFileName : undefined;
          }, undefined);
          if (matchFileName) return this.localStoragePath+_S_+priority+_S_+matchFileName;
          return undefined;
      }, undefined);
      const action = new Action(JSON.parse(fs.readFileSync(matchingFilePath)));
      fs.unlinkSync(matchingFilePath);
      Object.keys(data).forEach(key => {
        action[key] = data[key];
      });
      fs.writeFileSync(JSON.stringify(action));
      resolve();
    });
  }

  constructor(options) {
    mkPathFromRoot(options.moduleRoot, `.localStorage${_S_}${enums.LOW}`);
    mkPathFromRoot(options.moduleRoot, `.localStorage${_S_}${enums.MEDIUM}`);
    mkPathFromRoot(options.moduleRoot, `.localStorage${_S_}${enums.HIGH}`);
    this.localStoragePath = path.resolve(`${options.moduleRoot}${_S_}.localStorage`);
    this.fileParseRegExp = this._createFilenameTest();
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
   * @returns {*}
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
   * @returns @instance /Connectors/LocalStorageModels/ActionModel
   */
  _getHighestPriorityItem() {
    const nextHighestPriorityAction = [enums.HIGH, enums.MEDIUM, enums.LOW].map(priority => {
      const listFileName = this._getFileList(priority);
      if (listFileName.length > 0) {
        const fileData = this._getNextItemInList(listFileName);
        fileData.priority = priority;
        return fileData;
      }
      return undefined;
    }).reduce((pre, curr) => {
      if (typeof curr === undefined) return pre;
      if (typeof pre === undefined) return curr;
      return pre.date < curr.date ? pre : curr;
    }, undefined);

    const fName = this._createFilename(nextHighestPriorityAction);
    const data = JSON.parse(
      fs.readFileSync(
        `${this.localStoragePath}${_S_}${nextHighestPriorityAction.priority}${fName}`));

    return new Action(data);
  }

  /**
   * Create Filename For Storage
   * @param @instance /Connectors/LocalStorageModels/ActionModel
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
   * Create Filename test
   * @param @instance /Connectors/LocalStorageModels/ActionModel
   * @returns @instance /RegExp
   */
  _createFilenameTest(actionData) {
    if (!actionData || (!actionData.appId && !actionData.action && !actionData.date)) {
      return new RegExp('__d__(.*)(?=__ai__)__ai__(.*)(?=__ac__)__ac__(.*)$');
    }
    return new RegExp('__d__' + (!actionData.date ? '(.*)(?=__ai__)' : actionData.date) +
    '__ai__' + (!actionData.appId ? '(.*)(?=__ac__)' : actionData.appId) +
    '__ac__' + (!actionData.action ? '(.*)$' : actionData.action + '$')
    );
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
