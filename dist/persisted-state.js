"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _electronStore = _interopRequireDefault(require("electron-store"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var STORAGE_NAME = "vuex";
var STORAGE_KEY = "state";
var STORAGE_TEST_KEY = "test";

var PersistedState =
/*#__PURE__*/
function () {
  function PersistedState(options, store) {
    _classCallCheck(this, PersistedState);

    this.options = options;
    this.store = store;
    this.persistedStoreCopy = {};
  }

  _createClass(PersistedState, [{
    key: "loadOptions",
    value: function loadOptions() {
      if (!this.options.storage) this.options.storage = this.createStorage();
      if (!this.options.storageKey) this.options.storageKey = STORAGE_KEY;
      this.whitelist = this.loadFilter(this.options.whitelist, "whitelist");
      this.blacklist = this.loadFilter(this.options.blacklist, "blacklist");
      this.ignoredCommits = this.loadFilter(this.options.ignoredCommits, "ignoredCommits", this.options.invertIgnored);
    }
  }, {
    key: "createStorage",
    value: function createStorage() {
      return new _electronStore.default({
        name: this.options.storageName || STORAGE_NAME
      });
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.options.storage.get(this.options.storageKey);
    }
  }, {
    key: "setState",
    value: function setState(state) {
      this.options.storage.set(this.options.storageKey, state);
    }
  }, {
    key: "loadFilter",
    value: function loadFilter(filter, name, invertIgnored) {
      if (!filter) {
        return null;
      }

      if (filter instanceof Array) {
        return this.filterInArray(filter);
      }

      if (typeof filter === "function") {
        if (invertIgnored) {
          return function (mutation) {
            return !filter(mutation);
          };
        }

        return filter;
      }

      throw new Error("[Vuex Electron] Filter \"".concat(name, "\" should be Array or Function. Please, read the docs."));
    }
  }, {
    key: "filterInArray",
    value: function filterInArray(list) {
      var _this = this;

      return function (mutation) {
        if (_this.options.invertIgnored) {
          return !list.includes(mutation.type);
        }

        return list.includes(mutation.type);
      };
    } // Removes ignored paths from the store object before persisting it

  }, {
    key: "removeIgnoredPaths",
    value: function removeIgnoredPaths(state) {
      try {
        if (this.options.invertIgnored) {
          var newState = {};

          for (var i = 0; i < this.options.ignoredPaths.length; i++) {
            var path = this.options.ignoredPaths[i];
            this.setToValue(newState, this.deepFind(state, path), path);
          }

          return newState;
        } // Creates a copy of the store object


        var stateCopy = JSON.parse(JSON.stringify(state));

        for (var _i = 0; _i < this.options.ignoredPaths.length; _i++) {
          var _path = this.options.ignoredPaths[_i];
          this.deleteValue(stateCopy, _path);
        }

        return stateCopy;
      } catch (error) {
        throw new Error("[Vuex Electron] An error occurred while removing ignored paths from state. Please use a string array of property paths.");
      }
    } // Deletes, based on a given property path

  }, {
    key: "deleteValue",
    value: function deleteValue(obj, path) {
      var i;
      path = path.split(".");

      for (i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
      }

      delete obj[path[i]];
    } // Curtesy of qiao on Stack Overflow.

  }, {
    key: "deepFind",
    value: function deepFind(obj, path) {
      var paths = path.split("."),
          current = obj,
          i;

      for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] == undefined) {
          return undefined;
        } else {
          current = current[paths[i]];
        }
      }

      return current;
    }
  }, {
    key: "setToValue",
    value: function setToValue(obj, value, path) {
      var i;
      path = path.split(".");

      for (i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]];
      }

      obj[path[i]] = value;
    }
  }, {
    key: "checkStorage",
    value: function checkStorage() {
      try {
        this.options.storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY);
        this.options.storage.get(STORAGE_TEST_KEY);
        this.options.storage.delete(STORAGE_TEST_KEY);
      } catch (error) {
        throw new Error("[Vuex Electron] Storage is not valid. Please, read the docs.");
      }
    }
  }, {
    key: "combineMerge",
    value: function combineMerge(target, source, options) {
      var emptyTarget = function emptyTarget(value) {
        return Array.isArray(value) ? [] : {};
      };

      var clone = function clone(value, options) {
        return (0, _deepmerge.default)(emptyTarget(value), value, options);
      };

      var destination = target.slice();
      source.forEach(function (e, i) {
        if (typeof destination[i] === "undefined") {
          var cloneRequested = options.clone !== false;
          var shouldClone = cloneRequested && options.isMergeableObject(e);
          destination[i] = shouldClone ? clone(e, options) : e;
        } else if (options.isMergeableObject(e)) {
          destination[i] = (0, _deepmerge.default)(target[i], e, options);
        } else if (target.indexOf(e) === -1) {
          destination.push(e);
        }
      });
      return destination;
    }
  }, {
    key: "loadInitialState",
    value: function loadInitialState() {
      var state = this.getState(this.options.storage, this.options.storageKey);

      if (state) {
        var mergedState = (0, _deepmerge.default)(this.store.state, state, {
          arrayMerge: this.combineMerge
        });
        this.store.replaceState(mergedState);
      }
    }
  }, {
    key: "subscribeOnChanges",
    value: function subscribeOnChanges() {
      var _this2 = this;

      this.store.subscribe(function (mutation, state) {
        if (_this2.blacklist && _this2.blacklist(mutation)) return;
        if (_this2.whitelist && !_this2.whitelist(mutation)) return; // Returns if the current commit should not cause persistance.

        if (_this2.ignoredCommits && _this2.ignoredCommits(mutation)) return; // Filters the state before persisting, if ignoredPaths is set.

        if (_this2.options.ignoredPaths) {
          _this2.persistedStoreCopy = _this2.removeIgnoredPaths(state);

          _this2.setState(_this2.persistedStoreCopy);

          return;
        }

        _this2.setState(state);
      });
    }
  }]);

  return PersistedState;
}();

var _default = function _default() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (store) {
    var persistedState = new PersistedState(options, store);
    persistedState.loadOptions();
    persistedState.checkStorage();
    persistedState.loadInitialState();
    persistedState.subscribeOnChanges();
  };
};

exports.default = _default;
module.exports = exports["default"];