"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _deepmerge = _interopRequireDefault(require("deepmerge"));

var _electronStore = _interopRequireDefault(require("electron-store"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STORAGE_NAME = "vuex";
var STORAGE_KEY = "state";
var STORAGE_TEST_KEY = "test";

function createStorage(options) {
  return new _electronStore.default({
    name: options.storageName || STORAGE_NAME
  });
}

function getState(storage, key) {
  return storage.get(key);
}

function setState(storage, key, value) {
  storage.set(key, value);
}

function loadFilter(filter, arrayFilter, name) {
  if (!filter) {
    return null;
  } else if (filter instanceof Array) {
    return arrayFilter(filter);
  } else if (typeof filter === "function") {
    return filter;
  } else {
    new Error("[Vuex Electron] Filter \"".concat(name, "\" should be Array or Function. Please, read the docs."));
  }
}

function filterInArray(list) {
  return function (mutation) {
    return list.includes(mutation.type);
  };
}

function checkStorage(storage) {
  try {
    storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY);
    storage.get(STORAGE_TEST_KEY);
    storage.delete(STORAGE_TEST_KEY);
  } catch (error) {
    new Error("[Vuex Electron] Storage is not valid. Please, read the docs.");
  }
}

function loadInitialState(store, storage, key) {
  var state = getState(storage, key);

  if (state) {
    var mergedState = (0, _deepmerge.default)(store.state, state);
    store.replaceState(mergedState);
  }
}

function subscribeOnChanges(store, storage, key, blacklist, whitelist) {
  store.subscribe(function (mutation, state) {
    if (blacklist && blacklist(mutation)) {
      console.log("Mutation in the blacklist:", mutation.type);
      return;
    }

    if (whitelist && !whitelist(mutation)) {
      console.log("Mutation not in the whitelist:", mutation.type);
      return;
    }

    setState(storage, key, state); // console.log("Item was added:", mutation.type)
  });
}

var _default = function _default() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (store) {
    var storage = options.storage || createStorage(options);
    var key = options.storageKey || STORAGE_KEY;
    var whitelist = loadFilter(options.whitelist, filterInArray, "whitelist");
    var blacklist = loadFilter(options.blacklist, filterInArray, "blacklist");
    checkStorage(storage);
    loadInitialState(store, storage, key);
    subscribeOnChanges(store, storage, key, blacklist, whitelist);
  };
};

exports.default = _default;
module.exports = exports["default"];