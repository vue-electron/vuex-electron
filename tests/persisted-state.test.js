import { createStorage, createStore } from "./helpers"

describe("createPersistedState", () => {
  it("loads plugin", () => {
    expect(() => {
      createStore({ persistedState: { storage: createStorage() } })
    }).not.toThrow()
  })

  it("fails on loading when storage is not valid", () => {
    expect(() => {
      createStore({ persistedState: { storage: {} } })
    }).toThrow()
  })

  it("dumps the state", () => {
    const storage = createStorage()

    const store = createStore({ persistedState: { storage } })

    expect(storage.get("state")).toBeUndefined()

    const times = Math.floor(Math.random() * (10 - 3 + 1) + 3)

    for (let i = 1; i <= times; i++) {
      store.dispatch("increment")

      expect(store.state.count).toEqual(i)
      expect(storage.get("state").count).toEqual(i)
    }

    for (let i = times - 1; i > 0; i--) {
      store.dispatch("decrement")

      expect(store.state.count).toEqual(i)
      expect(storage.get("state").count).toEqual(i)
    }
  })

  it("loads the initial state", () => {
    const storage = createStorage()
    const randomNumber = Math.floor(Math.random() * (10 - 3 + 1) + 3)

    storage.set("state", { count: randomNumber, array: [1, 2, 3] })

    const store = createStore({ persistedState: { storage } })

    expect(store.state.count).toEqual(randomNumber)
  })

  it("filters whitelist (wrong type)", () => {
    const storage = createStorage()

    expect(() => {
      createStore({
        persistedState: {
          whitelist: {},
          storage
        }
      })
    }).toThrow()
  })

  it("filters whitelist (array)", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        whitelist: ["increment"],
        storage
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)
    expect(storage.get("state").count).toEqual(1)

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
    expect(storage.get("state").count).toEqual(1)
  })

  it("filters whitelist (function)", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        whitelist: (mutation) => ["increment"].includes(mutation.type),
        storage
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)
    expect(storage.get("state").count).toEqual(1)

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
    expect(storage.get("state").count).toEqual(1)
  })

  it("filters blacklist (wrong type)", () => {
    const storage = createStorage()

    expect(() => {
      createStore({
        persistedState: {
          blacklist: {},
          storage
        }
      })
    }).toThrow()
  })

  it("filters blacklist (array)", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        blacklist: ["increment"],
        storage
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)
    expect(storage.get("state")).toBeUndefined()

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
    expect(storage.get("state").count).toEqual(0)
  })

  it("filters blacklist (function)", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        blacklist: (mutation) => ["increment"].includes(mutation.type),
        storage
      }
    })

    store.dispatch("increment")
    expect(store.state.count).toEqual(1)
    expect(storage.get("state")).toBeUndefined()

    store.dispatch("decrement")
    expect(store.state.count).toEqual(0)
    expect(storage.get("state").count).toEqual(0)
  })
})
