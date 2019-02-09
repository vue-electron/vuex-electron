import Vue from "vue"
import Vuex from "vuex"

import { createPersistedState, createSharedMutations } from "../src"

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
      count: 0,
      count2: 0
    },
    actions: {
      increment({ commit }) {
        commit("increment")
      },

      decrement({ commit }) {
        commit("decrement")
      },

      increment2({ commit }) {
        commit("increment2")
      },

      decrement2({ commit }) {
        commit("decrement2")
      }
    },
    mutations: {
      increment(state) {
        state.count++
      },

      decrement(state) {
        state.count--
      },

      increment2(state) {
        state.count2++
      },

      decrement2(state) {
        state.count2--
      }
    },
    plugins
  })
}

export { createStorage, createStore }
