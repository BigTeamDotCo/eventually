const ActionsOverTime = require('./index').ActionsOverTime;
const config = require('./test.config.js').config;

const actionsOverTime = ActionsOverTime.createActionOverTimeEmitter(config);

let date = new Date();
let date2 = new Date();
date.setSeconds(date.getSeconds() + 10);
date2.setSeconds(date2.getSeconds() + 20);

actionsOverTime.addAction('testing', date, { data: 'data' });
actionsOverTime.addAction('testing', date2, { data: 'data' });

actionsOverTime.addAction('test', new Date(), { data: 'data' });
actionsOverTime.addAction('test', new Date(), { data: 'data' });
actionsOverTime.addAction('testing', new Date(), { data: 'data' });

actionsOverTime.addSubscriber('testing', (complete, reject, state) => {
  console.log(state);
  complete();
});

setTimeout(() => {
  actionsOverTime.addAction('test', new Date(), { data: 'data' });
  actionsOverTime.addSubscriber('test', (complete, reject, state) => {
    console.log(state);
    complete();
  });
}, 5000);
