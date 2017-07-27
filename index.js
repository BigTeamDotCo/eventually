const childProcess = require('child_process');
const AOTStore = {};
global.nodeAotModuleDir = path.resolve(__dirname);

class ActionsOverTime {
  static createActionOverTimeEmitter(options) {
    if (!options.key) {
      throw new Error('ActionsOverTime: can\'t create an emitter with no key.');
    }
    if (AOTStore[options.key]) {
      return AOTStore[options.key].actions;
    } else {
      const self = new ActionsOverTime(options);
      AOTStore[options.key] = { actions: {
        addAction: self.createAction.bind(self),
        removeAction: self.removeAction.bind(self),
        updateAction: self.updateAction.bind(self),
        addSubscriber: self.addSubscriber.bind(self)
      }};
      return AOTStore[options.key].actions;
    }
  }

  constructor(options) {
    this.options = options;
    this.createLoopFork();
  }

  completeActionCallback(callbackCount, actionEvent) {
    this.aotApp.send({ message: 'COMPLETE_ACTION' });
  }

  rejectActionCallback(reason) {
    if (reason.constructor.name === 'Error') {
      throw reason;
    } else {
      throw new Error(reason);
    }
  }

  handleResponse(actionEvent) {
    // Todo - support multiple callbacks
    AOTStore[this.options.key]['subscribers'][actionEvent.action][0](
      this.completeActionCallback.bind(this, actionEvent),
      this.rejectActionCallback.bind(this),
      actionEvent.actionState
    );
  }

  createLoopFork() {
    this.aotApp = childProcess.fork(global.nodeAotModuleDir + '/aot', [], { env: this.options });
    this.aotApp.on('message', this.handleResponse.bind(this));
  }

  addSubscriber(actionName, callback) {
    if (!AOTStore[this.options.key]['subscribers']) {
      AOTStore[this.options.key]['subscribers'] = {};
    }
    if (AOTStore[this.options.key]['subscribers'][actionName]) {
      console.warn('node-aot currently only support single subscribers');
      AOTStore[this.options.key]['subscribers'][actionName].push(callback);
    } else {
      AOTStore[this.options.key]['subscribers'][actionName] = [callback];
    }
    this.aotApp.send({ message: 'ADDED_SUBSCRIBER', action: actionName });
  }

  removeAction(appId, action) {
    this.aotApp.send({
      message: 'REMOVE_ACTION',
      actionData: { appId: appId, action: action }
    });
  }

  updateAction(appId, action, data) {
    this.aotApp.send({
      message: 'UPDATE_ACTION',
      actionData: { appId: appId, action: action, data: data }
    });
  }

  createAction(appId, actionName, date, state) {
    debugger;
    console.log(this.aotApp.send);
    this.aotApp.send({ message: 'ADD_ACTION', actionData: {
      appId: appId,
      action: actionName,
      date: date,
      actionState: state
    }});
  }
}

exports.ActionsOverTime = ActionsOverTime;
