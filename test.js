const ActionsOverTime = require('./index');
const config = require('./test.config.js').config;

ActionsOverTime.createActionOverTimeEmitter(config);
