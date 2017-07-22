const childProcess = require('child_process');
const AOTStore = {};

class ActionsOverTime {
  static createActionOverTimeEmitter(options) {
    if (!options.key) {
      throw new Error('ActionsOverTime: can\'t create an emitter with no key.');
    }
    if (AOTStore[options.key]) {
      return AOTStore[options.key];
    } else {
      const self = new ActionsOverTime(options);
      AOTStore[options.key] = self;
      return {
        addAction: self.createAction.bind(self),
        addSubscriber: self.addSubscriber.bind(self)
      }
    }
  }

  constructor(options) {
    this.options = options;
    this.createFork();
  }

  createFork() {
    this.aotApp = childProcess.fork(process.cwd() + '/aot', [], { env: this.options });
    this.aotApp.on('message', function(data) {
      console.log(data);
    })
  }

  addSubscriber() {
    this.aotApp.send({ action: 'ADDED_SUBSCRIBER' });
  }

  createAction(actionName, date) {
    this.aotApp.send({ action: 'ADD_ACTION', actionData: { name: actionName, date: date }});
  }
}

exports.ActionsOverTime = ActionsOverTime;
