import Vue from "vue"
import Vuex from "vuex"

import sharedMutations from "../src/shared-mutations"

Vue.use(Vuex)

const ipcMain = {
  on: () => {}
}

const ipcRenderer = {
  on: () => {}
}

describe("sharedMutations", () => {
  it("loads plugin", () => {
    expect(() => {
      new Vuex.Store({
        plugins: [sharedMutations({ ipcMain: ipcMain, ipcRenderer: ipcRenderer })]
      })
    }).not.toThrow()
  })
})
