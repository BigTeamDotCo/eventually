const mongoose = require('mongoose');
const ConnectorMongoose = require('./models/index.model.js').ConnectorMongoose;
const memoryCache = require('memory-cache');

(function () {
  let interval = undefined;
  const persistingAction = new ConnectorMongoose({
    host: process.env.host,
    port: process.env.port,
    user: process.env.user,
    dbName: process.env.dbName
  });
  let currentAction;

  persistingAction.getCurrentAction(function(err, action) {
    console.log(action);
    currentAction = action;
  });

  function subscriberAdded() {
    if (!interval) {
      interval = createLoop();
    }
  }

  function createLoop() {
    return setInterval(function() {
      checkCachedAction();
    }, 1000);
  }

  function checkCachedAction() {

  }

  function createAction(actionData) {
    persistingAction.createNewAction(actionData);
  }

  process.on('message', function(data) {
    switch (data.action) {
      case 'ADD_ACTION':
        createAction(data.actionData);
        break;
      case 'ADDED_SUBSCRIBER':
        subscriberAdded();
        break;
      default:
        // report error
        break;
    }
  });
})();
