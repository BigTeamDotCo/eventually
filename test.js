const ActionsOverTime = require('./index').ActionsOverTime;
const config = require('./test.config.js').config;

const actionsOverTime = ActionsOverTime.createActionOverTimeEmitter(config);
actionsOverTime.addSubscriber();

