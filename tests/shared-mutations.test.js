import { createStore } from "./helpers"

const ipcMain = {
  on: () => {}
}

const ipcRenderer = {
  on: () => {},
  send: () => {}
}

describe("createSharedMutations", () => {
  it("loads plugin", () => {
    expect(() => {
      createStore({
        sharedMutations: {
          ipcMain,
          ipcRenderer
        }
      })
    }).not.toThrow()
  })

  it("loads plugin (main mode)", () => {
    expect(() => {
      createStore({
        sharedMutations: {
          type: "main",
          ipcMain,
          ipcRenderer
        }
      })
    }).not.toThrow()
  })

  it("loads plugin (renderer mode)", () => {
    expect(() => {
      createStore({
        sharedMutations: {
          type: "renderer",
          ipcMain,
          ipcRenderer
        }
      })
    }).not.toThrow()
  })

  it("loads plugin (wrong mode)", () => {
    expect(() => {
      createStore({
        sharedMutations: {
          type: "wrong",
          ipcMain,
          ipcRenderer
        }
      })
    }).toThrow()
  })

  it("allows to use commit in main mode", () => {
    const store = createStore({
      sharedMutations: {
        type: "main",
        ipcMain,
        ipcRenderer
      }
    })

    expect(() => {
      store.commit("increment")
    }).not.toThrow()
  })

  it("does not allow to use commit in renderer mode", () => {
    const store = createStore({
      sharedMutations: {
        type: "renderer",
        ipcMain,
        ipcRenderer
      }
    })

    expect(() => {
      store.commit("increment")
    }).toThrow()
  })

  it("allows to use dispatch in main mode", () => {
    const store = createStore({
      sharedMutations: {
        type: "main",
        ipcMain,
        ipcRenderer
      }
    })

    expect(() => {
      store.dispatch("increment")
    }).not.toThrow()
  })

  it("allow to use dispatch in renderer mode", () => {
    const store = createStore({
      sharedMutations: {
        type: "renderer",
        ipcMain,
        ipcRenderer
      }
    })

    expect(() => {
      store.dispatch("increment")
    }).not.toThrow()
  })
})
