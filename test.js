const ActionsOverTime = require('./index').ActionsOverTime;
const config = require('./test.config.js').config;

const actionsOverTime = ActionsOverTime.createActionOverTimeEmitter(config);

let date = new Date();
let date2 = new Date();
date.setSeconds(date.getSeconds() + 10);
date2.setSeconds(date2.getSeconds() + 20);

actionsOverTime.addAction('testing', date);
actionsOverTime.addAction('testing', date2);

actionsOverTime.addAction('test', new Date());
actionsOverTime.addAction('test', new Date());
actionsOverTime.addAction('testing', new Date());

actionsOverTime.addSubscriber('testing', (complete, reject) => {
  complete();
});

setTimeout(() => {
  actionsOverTime.addAction('test', new Date());
  actionsOverTime.addSubscriber('test', (complete, reject) => {
    complete();
  });
}, 5000);
