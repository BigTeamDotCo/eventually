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
  let availableActions = [];

  function setupCurrentAction(error) {
    persistingAction.getCurrentAction(availableActions, function(err, action) {
      currentAction = action;
      if (currentAction) {
        console.log(action.date)
        currentActionDate = new Date(currentAction.date).getTime();
      }
    });
  }

  function addSubscriber(action) {
    availableActions.push(action);
    setupCurrentAction(null);
    createLoop();
  }

  function createLoop() {
    if (!interval) {
      interval = setInterval(function() {
        checkCachedAction();
      }, process.env.interval ? process.env.interval : 1000);
    }
  }

  function stopLoop() {
    clearInterval(interval);
    interval = undefined;
  }

  function checkCachedAction() {
    if (currentAction && Date.now() > currentActionDate) {
      process.send({ action: currentAction.action })
      stopLoop();
    }
  }

  function createAction(actionData) {
    persistingAction.createNewAction(actionData, () => {
      if (!currentAction) {
        setupCurrentAction();
      }
    });
  }

  function removeAction() {
    persistingAction.removeAction(currentAction._id, setupCurrentAction);
    createLoop();
  }

  process.on('message', function(data) {
    switch (data.message) {
      case 'ADD_ACTION':
        createAction(data.actionData);
        break;
      case 'ADDED_SUBSCRIBER':
        addSubscriber(data.action);
        break;
      case 'COMPLETE_ACTION':
        removeAction();
        break;
      default:
        // report error
        break;
    }
  });
})();
