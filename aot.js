const path = require('path');
const ConnectorMongoose = require(path.resolve(`${__dirname}/Connectors/Mongoose.Storage`));

(function () {
  let interval = undefined;
  const persistingAction = new ConnectorMongoose({
    test: process.env.test ? JSON.parse(process.env.test) : false,
    connectionString: process.env.connectionString,
    moduleRoot: __dirname,
    host: process.env.host,
    port: process.env.port,
    user: process.env.user,
    pass: process.env.password,
    dbName: process.env.dbName
  });
  let currentAction;
  let currentActionDate;
  let availableActions = [];

  function setupCurrentAction(error) {
    persistingAction.getCurrentAction(availableActions).then((actionList) => {
      if (actionList.length > 0) {
        currentAction = actionList[0];
        if (currentAction) {
          console.log(currentAction.date)
          currentActionDate = new Date(currentAction.date).getTime();
        }
      } else {
        currentAction = undefined;
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
    persistingAction.createNewAction(actionData).then(() => {
      setupCurrentAction();
    }).catch(e => {
        console.info('create action function');
        console.error(e);
    });
  }

  function removeCompletedAction() {
    persistingAction.removeActionById(currentAction._id).then(() => {
        setupCurrentAction();
        createLoop();
    }).catch(e => {
        console.info('remove completed action function');
        console.error(e);
    });
  }

  function removeAction(actionData) {
    if (currentAction && actionData.appId === currentAction.appId) {
      stopLoop();
    }
    persistingAction.removeAction(actionData.appId, actionData.action).then(() => {
      setupCurrentAction();
      createLoop();
    }).catch(e => {
        console.info('remove action function');
        console.error(e);
    });
  }

  function updateAction(actionData) {
    persistingAction.updateAction(
      actionData.appId,
      actionData.action,
      actionData.data
    ).then(() => {
        setupCurrentAction();
    }).catch(e => {
        console.info('update action function');
        console.error(e);
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


  const ROOT_FAIL_EVENT_NAME = 'uncaughtException';
  process.on(ROOT_FAIL_EVENT_NAME, e => {
    console.error(e);
  });

})();
