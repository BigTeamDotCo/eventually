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

  addSubscriber() {
    console.log(AOTStore)
  }

  createFork() {
    childProcess.fork(process.cwd() + 'aot', this.options);
  }

  createAction() {}
}

exports.ActionsOverTime = ActionsOverTime;
