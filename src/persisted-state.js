import merge from "deepmerge"
import Store from "electron-store"

const STORAGE_NAME = "vuex"
const STORAGE_KEY = "state"
const STORAGE_TEST_KEY = "test"

function createStorage(options) {
  return new Store({ name: options.storageName || STORAGE_NAME })
}

function getState(storage, key) {
  return storage.get(key)
}

function setState(storage, key, value) {
  storage.set(key, value)
}

function loadFilter(filter, arrayFilter, name) {
  if (!filter) {
    return null
  } else if (filter instanceof Array) {
    return arrayFilter(filter)
  } else if (typeof filter === "function") {
    return filter
  } else {
    new Error(`[Vuex Electron] Filter "${name}" should be Array or Function. Please, read the docs.`)
  }
}

function filterInArray(list) {
  return (mutation) => {
    return list.includes(mutation.type)
  }
}

function checkStorage(storage) {
  try {
    storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY)
    storage.get(STORAGE_TEST_KEY)
    storage.delete(STORAGE_TEST_KEY)
  } catch (error) {
    new Error("[Vuex Electron] Storage is not valid. Please, read the docs.")
  }
}

function loadInitialState(store, storage, key) {
  const state = getState(storage, key)

  if (state) {
    const mergedState = merge(store.state, state)
    store.replaceState(mergedState)
  }
}

function subscribeOnChanges(store, storage, key, blacklist, whitelist) {
  store.subscribe((mutation, state) => {
    if (blacklist && blacklist(mutation)) {
      console.log("Mutation in the blacklist:", mutation.type)

      return
    }

    if (whitelist && !whitelist(mutation)) {
      console.log("Mutation not in the whitelist:", mutation.type)

      return
    }

    setState(storage, key, state)

    // console.log("Item was added:", mutation.type)
  })
}

export default (options = {}) => (store) => {
  const storage   = options.storage    || createStorage(options)
  const key       = options.storageKey || STORAGE_KEY

  const whitelist = loadFilter(options.whitelist, filterInArray, "whitelist")
  const blacklist = loadFilter(options.blacklist, filterInArray, "blacklist")

  checkStorage(storage)
  loadInitialState(store, storage, key)
  subscribeOnChanges(store, storage, key, blacklist, whitelist)
}
