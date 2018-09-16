import { ipcMain, ipcRenderer } from "electron"

function SharedMutations(options, store) {
  const IPC_EVENT_CONNECT = "vuex-mutations-connect"
  const IPC_EVENT_NOTIFY_MAIN = "vuex-mutations-notify-main"
  const IPC_EVENT_NOTIFY_RENDERERS = "vuex-mutations-notify-renderers"

  this.loadOptions = () => {
    if (!options.type) options.type = process.type === "renderer" ? "renderer" : "main"
    if (!options.ipcMain) options.ipcMain = ipcMain
    if (!options.ipcRenderer) options.ipcRenderer = ipcRenderer
  }

  this.connect = (payload) => {
    options.ipcRenderer.send(IPC_EVENT_CONNECT, payload)
  }

  this.onConnect = (handler) => {
    options.ipcMain.on(IPC_EVENT_CONNECT, handler)
  }

  this.notifyMain = (payload) => {
    options.ipcRenderer.send(IPC_EVENT_NOTIFY_MAIN, payload)
  }

  this.onNotifyMain = (handler) => {
    options.ipcMain.on(IPC_EVENT_NOTIFY_MAIN, handler)
  }

  this.notifyRenderers = (connections, payload) => {
    Object.keys(connections).forEach((processId) => {
      connections[processId].send(IPC_EVENT_NOTIFY_RENDERERS, payload)
    })
  }

  this.onNotifyRenderers = (handler) => {
    options.ipcRenderer.on(IPC_EVENT_NOTIFY_RENDERERS, handler)
  }

  this.rendererProcessLogic = () => {
    // Connect renderer to main process
    this.connect()

    // Save original Vuex methods
    store.originalCommit = store.commit
    store.originalDispatch = store.dispatch

    // Don't use commit in renderer outside of actions
    store.commit = () => {
      throw new Error(`[Vuex Electron] Please, don't use direct commit's, use dispatch instead of this.`)
    }

    // Forward dispatch to main process
    store.dispatch = (type, payload) => {
      this.notifyMain({ type, payload })
    }

    // Subscribe on changes from main process and apply them
    this.onNotifyRenderers((event, { type, payload }) => {
      store.originalCommit(type, payload)
    })
  }

  this.mainProcessLogic = () => {
    const connections = {}

    // Save new connection
    this.onConnect((event) => {
      connections[event.sender.id] = event.sender

      // Remove connection when window is closed
      event.sender.on("destroyed", () => {
        delete connections[event.sender.id]
      })
    })

    // Subscribe on changes from renderer processes
    this.onNotifyMain((event, { type, payload }) => {
      store.dispatch(type, payload)
    })

    // Subscribe on changes from Vuex store
    store.subscribe((mutation) => {
      const { type, payload } = mutation

      // Forward changes to renderer processes
      this.notifyRenderers(connections, { type, payload })
    })
  }

  this.activatePlugin = () => {
    switch (options.type) {
      case "renderer":
        this.rendererProcessLogic()
        break
      case "main":
        this.mainProcessLogic()
        break
      default:
        throw new Error(`[Vuex Electron] Type should be "renderer" or "main".`)
    }
  }
}

export default (options = {}) => (store) => {
  const sharedMutations = new SharedMutations(options, store)

  sharedMutations.loadOptions()
  sharedMutations.activatePlugin()
}
