import Vue from "vue"
import Vuex from "vuex"

import persistedState from "../src/persisted-state"

Vue.use(Vuex)

const storage = {
  storage: {},

  set: (key, value) => (storage[key] = value),
  get: (key) => storage[key],
  delete: (key) => delete storage[key]
}

describe("persistedState", () => {
  it("loads plugin", () => {
    expect(() => {
      new Vuex.Store({
        plugins: [persistedState({ storage: storage })]
      })
    }).not.toThrow()
  })

  it("fails on loading when storage is not valid", () => {
    expect(() => {
      new Vuex.Store({
        plugins: [persistedState({ storage: {} })]
      })
    }).toThrow()
  })
})
