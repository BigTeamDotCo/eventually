const path = require('path');
const ActionsOverTime = require(path.resolve('./index')).ActionsOverTime;
const config = require(path.resolve('./test.config')).config;

const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

const actionsOverTime = ActionsOverTime.createActionOverTimeEmitter(config);

let date = new Date();
let date2 = new Date();
date.setSeconds(date.getSeconds() + 10);
date2.setSeconds(date2.getSeconds() + 20);

let rememberDate2 = ObjectId();
let rememberDate1 = ObjectId();

actionsOverTime.addAction(rememberDate1, 'testing', date, { data: 'data + 1000' });
actionsOverTime.addAction(rememberDate2, 'testing', date2, { data: 'data + 2000' });

actionsOverTime.addAction(ObjectId(), 'test', new Date(), { data: '1st data' });
actionsOverTime.addAction(ObjectId(), 'test', new Date(), { data: '2nd data' });
actionsOverTime.addAction(ObjectId(), 'testing', new Date(), { data: '3rd data' });

actionsOverTime.addSubscriber('testing', (complete, reject, state) => {
  console.log(state);
  complete();
});

setTimeout(() => {
  actionsOverTime.addAction(ObjectId(), 'test', new Date(), { data: 'in 5000 Timeout data' });
  actionsOverTime.addSubscriber('test', (complete, reject, state) => {
    console.log(state);
    complete();
  });
}, 5000);

setTimeout(() => {
  actionsOverTime.removeAction(rememberDate1, 'testing');
  actionsOverTime.updateAction(rememberDate2, 'testing', { data: 'data + 20, updated' });
}, 500);
