const path = require('path');
const ActionsOverTime = require(path.resolve('./index')).ActionsOverTime;
const config = require(path.resolve('./test.config')).config;
const actionsOverTime = ActionsOverTime.createActionOverTimeEmitter(config);
const ObjectId = require('../utilities/Mongo.ObjectId');

let date = new Date();
let date2 = new Date();
let date500 = new Date();
date.setSeconds(date.getSeconds() + 10);
date500.setSeconds(date500.getSeconds() + 5);
date2.setSeconds(date2.getSeconds() + 20);

let rememberDate2 = ObjectId();
let rememberDate3= ObjectId();
let rememberDate1 = ObjectId();

actionsOverTime.addSubscriber('testing', (complete, reject, state) => {
  console.log(state);
  complete();
});

actionsOverTime.addAction(rememberDate1, 'testing', date, { data: 'data + 10' });
actionsOverTime.addAction(rememberDate3, 'testing', date500, { data: 'data + 5' });
actionsOverTime.addAction(rememberDate2, 'testing', date2, { data: 'data + 2000' });

actionsOverTime.addAction(ObjectId(), 'test', new Date(), { data: '1st data' });
actionsOverTime.addAction(ObjectId(), 'test', new Date(), { data: '2nd data' });
actionsOverTime.addAction(ObjectId(), 'testing', new Date(), { data: '3rd data' });

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


describe('Eventually CRUD', () => {
  xit('should be able to add actions');
  xit('should be able to remove actions');
  xit('should be able to update actions');
  xit('should be able to list actions');
});
