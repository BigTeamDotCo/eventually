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
  let currentActionDate;

  persistingAction.getCurrentAction(function(err, action) {
    currentAction = action;
    currentActionDate = new Date(currentAction.date).getTime();
  });

  function subscriberAdded() {
    if (!interval) {
      interval = createLoop();
    }
  }

  function createLoop() {
    return setInterval(function() {
      checkCachedAction();
    }, process.env.interval ? process.env.interval : 1000);
  }

  function checkCachedAction() {
    if (Date.now() > currentActionDate) {
      process.send(currentAction.action)
    }
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
