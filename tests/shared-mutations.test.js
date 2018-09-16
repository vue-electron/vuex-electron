import { createStore } from "./helpers"

const ipcMain = {
  on: () => {}
}

const ipcRenderer = {
  on: () => {},
  send: () => {}
}

describe("createSharedMutations", () => {
  it("loads plugin (main mode)", () => {
    expect(() => {
      createStore({
        sharedMutations: {
          type: "main",
          ipcMain: ipcMain,
          ipcRenderer: ipcRenderer
        }
      })
    }).not.toThrow()
  })

  it("loads plugin (renderer mode)", () => {
    expect(() => {
      createStore({
        sharedMutations: {
          type: "renderer",
          ipcMain: ipcMain,
          ipcRenderer: ipcRenderer
        }
      })
    }).not.toThrow()
  })

  it("loads plugin (wrong mode)", () => {
    expect(() => {
      createStore({
        sharedMutations: {
          type: "wrong",
          ipcMain: ipcMain,
          ipcRenderer: ipcRenderer
        }
      })
    }).toThrow()
  })
})
