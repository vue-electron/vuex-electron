import Vue from "vue"
import Vuex from "vuex"

import createPersistedState from "../src/persisted-state"
import createSharedMutations from "../src/shared-mutations"

Vue.use(Vuex)

function createStorage() {
  const storage = {}

  return {
    set: (key, value) => (storage[key] = { ...value }),
    get: (key) => storage[key],
    delete: (key) => delete storage[key]
  }
}

function createStore(options = {}) {
  const plugins = []

  if (options.persistedState) plugins.push(createPersistedState(options.persistedState))
  if (options.sharedMutations) plugins.push(createSharedMutations(options.sharedMutations))

  return new Vuex.Store({
    state: {
      count: 0
    },
    actions: {
      increment({ commit }) {
        commit("increment")
      },

      decrement({ commit }) {
        commit("decrement")
      }
    },
    mutations: {
      increment(state) {
        state.count++
      },

      decrement(state) {
        state.count--
      }
    },
    plugins
  })
}

export { createStorage, createStore }
