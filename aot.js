const mongoose = require('mongoose');
const path = require('path');
const ConnectorMongoose = require(path.resolve('./models/index.model.js')).ConnectorMongoose;
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
      process.send({ action: currentAction.action, actionState: currentAction.actionState })
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

  function removeCompletedAction() {
    persistingAction.removeActionById(currentAction._id, setupCurrentAction);
    createLoop();
  }

  function removeAction(actionData) {
    if (currentAction && actionData.appId === currentAction.appId) {
      stopLoop();
    }
    persistingAction.removeAction(actionData.appId, actionData.action, () => {
      setupCurrentAction();
    });
  }

  function updateAction(actionData) {
    persistingAction.updateAction(
      actionData.appId,
      actionData.action,
      actionData.data,
      () => {
        setupCurrentAction();
      });
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
        removeCompletedAction();
        break;
      case 'UPDATE_ACTION':
        updateAction(data.actionData);
        break;
      case 'REMOVE_ACTION':
        removeAction(data.actionData);
        break;
      default:
        // report error
        break;
    }
  });
})();
