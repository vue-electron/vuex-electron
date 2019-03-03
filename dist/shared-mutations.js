"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _electron = require("electron");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var IPC_EVENT_CONNECT = "vuex-mutations-connect";
var IPC_EVENT_NOTIFY_MAIN = "vuex-mutations-notify-main";
var IPC_EVENT_NOTIFY_RENDERERS = "vuex-mutations-notify-renderers";

var SharedMutations =
/*#__PURE__*/
function () {
  function SharedMutations(options, store) {
    _classCallCheck(this, SharedMutations);

    this.options = options;
    this.store = store;
  }

  _createClass(SharedMutations, [{
    key: "loadOptions",
    value: function loadOptions() {
      if (!this.options.type) this.options.type = process.type === "renderer" ? "renderer" : "main";
      if (!this.options.ipcMain) this.options.ipcMain = _electron.ipcMain;
      if (!this.options.ipcRenderer) this.options.ipcRenderer = _electron.ipcRenderer;
    }
  }, {
    key: "connect",
    value: function connect(payload) {
      this.options.ipcRenderer.send(IPC_EVENT_CONNECT, payload);
    }
  }, {
    key: "onConnect",
    value: function onConnect(handler) {
      this.options.ipcMain.on(IPC_EVENT_CONNECT, handler);
    }
  }, {
    key: "notifyMain",
    value: function notifyMain(payload) {
      this.options.ipcRenderer.send(IPC_EVENT_NOTIFY_MAIN, payload);
    }
  }, {
    key: "onNotifyMain",
    value: function onNotifyMain(handler) {
      this.options.ipcMain.on(IPC_EVENT_NOTIFY_MAIN, handler);
    }
  }, {
    key: "notifyRenderers",
    value: function notifyRenderers(connections, payload) {
      Object.keys(connections).forEach(function (processId) {
        connections[processId].send(IPC_EVENT_NOTIFY_RENDERERS, payload);
      });
    }
  }, {
    key: "onNotifyRenderers",
    value: function onNotifyRenderers(handler) {
      this.options.ipcRenderer.on(IPC_EVENT_NOTIFY_RENDERERS, handler);
    }
  }, {
    key: "rendererProcessLogic",
    value: function rendererProcessLogic() {
      var _this = this;

      // Connect renderer to main process
      this.connect(); // Save original Vuex methods

      this.store.originalCommit = this.store.commit;
      this.store.originalDispatch = this.store.dispatch; // Don't use commit in renderer outside of actions

      this.store.commit = function () {
        throw new Error("[Vuex Electron] Please, don't use direct commit's, use dispatch instead of this.");
      }; // Forward dispatch to main process


      this.store.dispatch = function (type, payload) {
        _this.notifyMain({
          type: type,
          payload: payload
        });
      }; // Subscribe on changes from main process and apply them


      this.onNotifyRenderers(function (event, _ref) {
        var type = _ref.type,
            payload = _ref.payload;

        _this.store.originalCommit(type, payload);
      });
    }
  }, {
    key: "mainProcessLogic",
    value: function mainProcessLogic() {
      var _this2 = this;

      var connections = {}; // Save new connection

      this.onConnect(function (event) {
        var win = event.sender;
        var winId = win.id;
        connections[winId] = win; // Remove connection when window is closed

        win.on("destroyed", function () {
          delete connections[winId];
        });
      }); // Subscribe on changes from renderer processes

      this.onNotifyMain(function (event, _ref2) {
        var type = _ref2.type,
            payload = _ref2.payload;

        _this2.store.dispatch(type, payload);
      }); // Subscribe on changes from Vuex store

      this.store.subscribe(function (mutation) {
        var type = mutation.type,
            payload = mutation.payload; // Forward changes to renderer processes

        _this2.notifyRenderers(connections, {
          type: type,
          payload: payload
        });
      });
    }
  }, {
    key: "activatePlugin",
    value: function activatePlugin() {
      switch (this.options.type) {
        case "renderer":
          this.rendererProcessLogic();
          break;

        case "main":
          this.mainProcessLogic();
          break;

        default:
          throw new Error("[Vuex Electron] Type should be \"renderer\" or \"main\".");
      }
    }
  }]);

  return SharedMutations;
}();

var _default = function _default() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (store) {
    var sharedMutations = new SharedMutations(options, store);
    sharedMutations.loadOptions();
    sharedMutations.activatePlugin();
  };
};

exports.default = _default;
module.exports = exports["default"];