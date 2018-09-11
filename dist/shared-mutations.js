"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _electron = require("electron");

var IPC_EVENT_CONNECT = "vuex-mutations-connect";
var IPC_EVENT_NOTIFY_MAIN = "vuex-mutations-notify-main";
var IPC_EVENT_NOTIFY_RENDERERS = "vuex-mutations-notify-renderers"; // IPC Configuration

function connect(ipc, payload) {
  ipc.send(IPC_EVENT_CONNECT, payload);
}

function onConnect(ipc, handler) {
  ipc.on(IPC_EVENT_CONNECT, handler);
}

function notifyMain(ipc, payload) {
  ipc.send(IPC_EVENT_NOTIFY_MAIN, payload);
}

function onNotifyMain(ipc, handler) {
  ipc.on(IPC_EVENT_NOTIFY_MAIN, handler);
}

function notifyRenderers(ipc, payload, connections) {
  Object.keys(connections).forEach(function (processId) {
    connections[processId].send(IPC_EVENT_NOTIFY_RENDERERS, payload);
  });
}

function onNotifyRenderers(ipc, handler) {
  ipc.on(IPC_EVENT_NOTIFY_RENDERERS, handler);
}

function rendererProcessLogic(store) {
  // Connect renderer to main process
  connect(_electron.ipcRenderer); // Save original Vuex methods

  store.originalCommit = store.commit;
  store.originalDispatch = store.dispatch; // Don't use commit in renderer outside of actions

  store.commit = function () {
    console.error("[Vuex Electron] Please, don't use direct commit's, use dispatch instead of this.");
  }; // Forward dispatch to main process


  store.dispatch = function (type, payload) {
    notifyMain(_electron.ipcRenderer, {
      type: type,
      payload: payload
    });
  }; // Subscribe on changes from main process and apply them


  onNotifyRenderers(_electron.ipcRenderer, function (event, _ref) {
    var type = _ref.type,
        payload = _ref.payload;
    store.originalCommit(type, payload);
  });
}

function mainProcessLogic(store) {
  var connections = {}; // Save new connection

  onConnect(_electron.ipcMain, function (event) {
    var win = event.sender;
    connections[win.id] = win; // Remove connection when window is closed

    win.on("destroyed", function () {
      delete connections[win.id];
    });
  }); // Subscribe on changes from renderer processes

  onNotifyMain(_electron.ipcMain, function (event, _ref2) {
    var type = _ref2.type,
        payload = _ref2.payload;
    store.dispatch(type, payload);
  }); // Subscribe on changes from Vuex store

  store.subscribe(function (mutation) {
    var type = mutation.type,
        payload = mutation.payload; // Forward changes to renderer processes

    notifyRenderers(_electron.ipcMain, {
      type: type,
      payload: payload
    }, connections);
  });
}

var _default = function _default() {
  return function (store) {
    var isRenderer = process.type === "renderer";

    if (isRenderer) {
      rendererProcessLogic(store);
    } else {
      mainProcessLogic(store);
    }
  };
};

exports.default = _default;
module.exports = exports["default"];