import merge from "deepmerge"
import Store from "electron-store"

const STORAGE_NAME = "vuex"
const STORAGE_KEY = "state"
const STORAGE_TEST_KEY = "test"

class PersistedState {
  constructor(options, store) {
    this.options = options
    this.store = store
    this.persistedStoreCopy = {}
  }

  loadOptions() {
    if (!this.options.storage) this.options.storage = this.createStorage()
    if (!this.options.storageKey) this.options.storageKey = STORAGE_KEY

    this.whitelist = this.loadFilter(this.options.whitelist, "whitelist")
    this.blacklist = this.loadFilter(this.options.blacklist, "blacklist")

    this.ignoredCommits = this.loadFilter(this.options.ignoredCommits, "ignoredCommits", this.options.invertIgnored)
  }

  createStorage() {
    return new Store({ name: this.options.storageName || STORAGE_NAME })
  }

  getState() {
    return this.options.storage.get(this.options.storageKey)
  }

  setState(state) {
    this.options.storage.set(this.options.storageKey, state)
  }

  loadFilter(filter, name, invertIgnored) {
    if (!filter) {
      return null
    }
    if (filter instanceof Array) {
      return this.filterInArray(filter)
    }
    if (typeof filter === "function") {
      if (invertIgnored) {
        return (mutation) => {
          return !filter(mutation)
        }
      }
      return filter
    }
    throw new Error(`[Vuex Electron] Filter "${name}" should be Array or Function. Please, read the docs.`)
  }

  filterInArray(list) {
    return (mutation) => {
      if (this.options.invertIgnored) {
        return !list.includes(mutation.type)
      }
      return list.includes(mutation.type)
    }
  }

  // Removes ignored paths from the store object before persisting it
  removeIgnoredPaths(state) {
    try {
      if (this.options.invertIgnored) {
        var newState = {}
        for (let i = 0; i < this.options.ignoredPaths.length; i++) {
          const path = this.options.ignoredPaths[i]
          this.setToValue(newState, this.deepFind(state, path), path)
        }
        return newState
      }

      // Creates a copy of the store object
      var stateCopy = JSON.parse(JSON.stringify(state))
      for (let i = 0; i < this.options.ignoredPaths.length; i++) {
        const path = this.options.ignoredPaths[i]
        this.deleteValue(stateCopy, path)
      }
      return stateCopy
    } catch (error) {
      throw new Error(
        "[Vuex Electron] An error occurred while removing ignored paths from state. Please use a string array of property paths."
      )
    }
  }

  // Deletes, based on a given property path
  deleteValue(obj, path) {
    var i
    path = path.split(".")
    for (i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]]
    }

    delete obj[path[i]]
  }

  // Curtesy of qiao on Stack Overflow.
  deepFind(obj, path) {
    var paths = path.split("."),
      current = obj,
      i

    for (i = 0; i < paths.length; ++i) {
      if (current[paths[i]] == undefined) {
        return undefined
      } else {
        current = current[paths[i]]
      }
    }
    return current
  }

  setToValue(obj, value, path) {
    var i
    path = path.split(".")
    for (i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]]
    }

    obj[path[i]] = value
  }

  checkStorage() {
    try {
      this.options.storage.set(STORAGE_TEST_KEY, STORAGE_TEST_KEY)
      this.options.storage.get(STORAGE_TEST_KEY)
      this.options.storage.delete(STORAGE_TEST_KEY)
    } catch (error) {
      throw new Error("[Vuex Electron] Storage is not valid. Please, read the docs.")
    }
  }

  combineMerge(target, source, options) {
    const emptyTarget = (value) => (Array.isArray(value) ? [] : {})
    const clone = (value, options) => merge(emptyTarget(value), value, options)
    const destination = target.slice()

    source.forEach(function(e, i) {
      if (typeof destination[i] === "undefined") {
        const cloneRequested = options.clone !== false
        const shouldClone = cloneRequested && options.isMergeableObject(e)
        destination[i] = shouldClone ? clone(e, options) : e
      } else if (options.isMergeableObject(e)) {
        destination[i] = merge(target[i], e, options)
      } else if (target.indexOf(e) === -1) {
        destination.push(e)
      }
    })

    return destination
  }

  loadInitialState() {
    const state = this.getState(this.options.storage, this.options.storageKey)

    if (state) {
      const mergedState = merge(this.store.state, state, { arrayMerge: this.combineMerge })
      this.store.replaceState(mergedState)
    }
  }

  subscribeOnChanges() {
    this.store.subscribe((mutation, state) => {
      if (this.blacklist && this.blacklist(mutation)) return
      if (this.whitelist && !this.whitelist(mutation)) return

      // Returns if the current commit should not cause persistance.
      if (this.ignoredCommits && this.ignoredCommits(mutation)) return

      // Filters the state before persisting, if ignoredPaths is set.
      if (this.options.ignoredPaths) {
        this.persistedStoreCopy = this.removeIgnoredPaths(state)
        this.setState(this.persistedStoreCopy)
        return
      }

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
