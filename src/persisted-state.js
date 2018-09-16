import merge from "deepmerge"
import Store from "electron-store"

function PersistedState(options, store) {
  const STORAGE_NAME = "vuex"
  const STORAGE_KEY = "state"
  const STORAGE_TEST_KEY = "test"

  this.loadOptions = () => {
    if (!options.storage) options.storage = this.createStorage()
    if (!options.storageKey) options.storageKey = STORAGE_KEY

    this.whitelist = this.loadFilter(options.whitelist, "whitelist")
    this.blacklist = this.loadFilter(options.blacklist, "blacklist")
  }

  this.createStorage = () => {
    return new Store({ name: options.storageName || STORAGE_NAME })
  }

  this.getState = () => {
    return options.storage.get(options.storageKey)
  }

  this.setState = (state) => {
    options.storage.set(options.storageKey, state)
  }

  this.loadFilter = (filter, name) => {
    if (!filter) {
      return null
    } else if (filter instanceof Array) {
      return this.filterInArray(filter)
    } else if (typeof filter === "function") {
      return filter
    } else {
      throw new Error(`[Vuex Electron] Filter "${name}" should be Array or Function. Please, read the docs.`)
    }
  }

  this.filterInArray = (list) => {
    return (mutation) => {
      return list.includes(mutation.type)
    }
  }

  this.checkStorage = () => {
    try {
      options.storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY)
      options.storage.get(STORAGE_TEST_KEY)
      options.storage.delete(STORAGE_TEST_KEY)
    } catch (error) {
      throw new Error("[Vuex Electron] Storage is not valid. Please, read the docs.")
    }
  }

  this.loadInitialState = () => {
    const state = this.getState(options.storage, options.storageKey)

    if (state) {
      const mergedState = merge(store.state, state)
      store.replaceState(mergedState)
    }
  }

  this.subscribeOnChanges = () => {
    store.subscribe((mutation, state) => {
      if (this.blacklist && this.blacklist(mutation)) return
      if (this.whitelist && !this.whitelist(mutation)) return

      this.setState(state)
    })
  }
}

export default (options = {}) => (store) => {
  const persistedState = new PersistedState(options, store)

  persistedState.loadOptions()
  persistedState.checkStorage()
  persistedState.loadInitialState()
  persistedState.subscribeOnChanges()
}
