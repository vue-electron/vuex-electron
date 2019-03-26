import { ipcMain, ipcRenderer } from "electron"
import equal from "fast-deep-equal"

const IPC_EVENT_CONNECT = "vuex-mutations-connect"
const IPC_EVENT_NOTIFY_MAIN = "vuex-mutations-notify-main"
const IPC_EVENT_NOTIFY_RENDERERS = "vuex-mutations-notify-renderers"

class SharedMutations {
  constructor(options, store) {
    this.options = options
    this.store = store
  }

  loadOptions() {
    if (!this.options.type) this.options.type = process.type === "renderer" ? "renderer" : "main"
    if (!this.options.ipcMain) this.options.ipcMain = ipcMain
    if (!this.options.ipcRenderer) this.options.ipcRenderer = ipcRenderer
  }

  connect(payload) {
    this.options.ipcRenderer.send(IPC_EVENT_CONNECT, payload)
  }

  onConnect(handler) {
    this.options.ipcMain.on(IPC_EVENT_CONNECT, handler)
  }

  notifyMain(payload) {
    this.options.ipcRenderer.send(IPC_EVENT_NOTIFY_MAIN, payload)
  }

  onNotifyMain(handler) {
    this.options.ipcMain.on(IPC_EVENT_NOTIFY_MAIN, handler)
  }

  notifyRenderers(connections, payload, excludeId = -1) {
    Object.keys(connections).forEach((processId) => {
      Number(processId) !== excludeId && connections[processId].send(IPC_EVENT_NOTIFY_RENDERERS, payload)
    })
  }

  onNotifyRenderers(handler) {
    this.options.ipcRenderer.on(IPC_EVENT_NOTIFY_RENDERERS, handler)
  }

  rendererProcessLogic() {
    // Connect renderer to main process
    this.connect()

    // Forward commit to main process
    this.store.subscribe((mutation) => {
      // If both mutation equal is intercept notify
      let lastMutation = { type: this.lastType, payload: this.lastPayload }
      if (equal(lastMutation, mutation)) {
        this.lastType = null
        this.lastPayload = null
      } else {
        this.notifyMain(mutation)
      }
    })

    // Subscribe on changes from main process and apply them
    this.onNotifyRenderers((event, { type, payload }) => {
      this.lastType = type
      this.lastPayload = payload
      this.store.commit(type, payload)
    })
  }

  mainProcessLogic() {
    const connections = {}

    // Save new connection
    this.onConnect((event) => {
      const win = event.sender
      const winId = win.id

      connections[winId] = win

      // Remove connection when window is closed
      win.on("destroyed", () => {
        delete connections[winId]
      })
    })

    this.store.subscribe((mutation) => {
      // If both mutation equal is intercept notify
      let lastMutation = { type: this.lastType, payload: this.lastPayload }
      if (equal(lastMutation, mutation)) {
        this.lastType = null
        this.lastPayload = null
      } else {
        this.notifyRenderers(connections, mutation)
      }
    })

    // Subscribe on changes from renderer processes
    this.onNotifyMain((event, { type, payload }) => {
      this.lastType = type
      this.lastPayload = payload
      this.store.commit(type, payload)
      // Forward changes to renderer processes
      this.notifyRenderers(connections, { type, payload }, event.sender.id)
    })
  }

  activatePlugin() {
    switch (this.options.type) {
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
