import { ipcMain, ipcRenderer } from "electron"

const IPC_EVENT_CONNECT = "vuex-mutations-connect"
const IPC_EVENT_NOTIFY_MAIN = "vuex-mutations-notify-main"
const IPC_EVENT_NOTIFY_RENDERERS = "vuex-mutations-notify-renderers"

// IPC Configuration
function connect(ipc, payload) {
  ipc.send(IPC_EVENT_CONNECT, payload)
}

function onConnect(ipc, handler) {
  ipc.on(IPC_EVENT_CONNECT, handler)
}

function notifyMain(ipc, payload) {
  ipc.send(IPC_EVENT_NOTIFY_MAIN, payload)
}

function onNotifyMain(ipc, handler) {
  ipc.on(IPC_EVENT_NOTIFY_MAIN, handler)
}

function notifyRenderers(ipc, payload, connections) {
  Object.keys(connections).forEach((processId) => {
    connections[processId].send(IPC_EVENT_NOTIFY_RENDERERS, payload)
  })
}

function onNotifyRenderers(ipc, handler) {
  ipc.on(IPC_EVENT_NOTIFY_RENDERERS, handler)
}

function rendererProcessLogic(store) {
  // Connect renderer to main process
  connect(ipcRenderer)

  // Save original Vuex methods
  store.originalCommit = store.commit
  store.originalDispatch = store.dispatch

  // Don't use commit in renderer outside of actions
  store.commit = () => {
    console.error(`[Vuex Electron] Please, don't use direct commit's, use dispatch instead of this.`)
  }

  // Forward dispatch to main process
  store.dispatch = (type, payload) => {
    notifyMain(ipcRenderer, { type, payload })
  }

  // Subscribe on changes from main process and apply them
  onNotifyRenderers(ipcRenderer, (event, { type, payload }) => {
    store.originalCommit(type, payload)
  })
}

function mainProcessLogic(store) {
  const connections = {}

  // Save new connection
  onConnect(ipcMain, (event) => {
    const win = event.sender

    connections[win.id] = win

    // Remove connection when window is closed
    win.on("destroyed", () => {
      delete connections[win.id]
    })
  })

  // Subscribe on changes from renderer processes
  onNotifyMain(ipcMain, (event, { type, payload }) => {
    store.dispatch(type, payload)
  })

  // Subscribe on changes from Vuex store
  store.subscribe((mutation) => {
    const { type, payload } = mutation

    // Forward changes to renderer processes
    notifyRenderers(ipcMain, { type, payload }, connections)
  })
}

export default () => (store) => {
  const isRenderer = process.type === "renderer"

  if (isRenderer) {
    rendererProcessLogic(store)
  } else {
    mainProcessLogic(store)
  }
}
