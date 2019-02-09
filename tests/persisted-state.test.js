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

  it("filters ignoredCommits (wrong type)", () => {
    const storage = createStorage()

    expect(() => {
      createStore({
        persistedState: {
          ignoredCommits: {},
          storage
        }
      })
    }).toThrow()
  })

  it("filters ignoredCommits (array)", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        ignoredCommits: ["increment"],
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

  it("filters ignoredCommits (function)", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        ignoredCommits: (mutation) => ["increment"].includes(mutation.type),
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

  it("filters using ignoredPaths", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        ignoredPaths: ["count"],
        storage
      }
    })

    store.dispatch("increment") // Modifications will NOT be allowed to be persisted.
    expect(store.state.count).toEqual(1)
    expect(storage.get("state").count).toBeUndefined()

    store.dispatch("decrement") // Modifications will NOT be allowed to be persisted.
    expect(store.state.count).toEqual(0)
    expect(storage.get("state").count).toBeUndefined()
  })

  it("filters using ignoredPaths and ignoredCommits", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        ignoredPaths: ["count"],
        ignoredCommits: (mutation) => ["increment2"].includes(mutation.type),
        storage
      }
    })

    store.dispatch("increment") // Modifications will NOT be allowed to be persisted, but WILL trigger a persistance.
    expect(store.state.count).toEqual(1)
    expect(storage.get("state").count).toBeUndefined()

    store.dispatch("decrement") // Modifications will NOT be allowed to be persisted, but WILL trigger a persistance.
    expect(store.state.count).toEqual(0)
    expect(storage.get("state").count).toBeUndefined()

    store.dispatch("increment2") // Modifications WILL be allowed to be persisted, but wont trigger a persistance.
    expect(store.state.count2).toEqual(1)
    expect(storage.get("state").count2).toEqual(0)

    store.dispatch("decrement2") // Modifications WILL be allowed to be persisted, AND WILL trigger a persistance.
    expect(store.state.count2).toEqual(0)
    expect(storage.get("state").count2).toEqual(0)
  })

  it("filters using ignoredPaths, ignoredCommits and invertIgnored", () => {
    const storage = createStorage()

    const store = createStore({
      persistedState: {
        ignoredPaths: ["count"],
        ignoredCommits: (mutation) => ["increment2"].includes(mutation.type),
        invertIgnored: true,
        storage
      }
    })

    store.dispatch("increment") // Modifications will be allowed to be persisted, but wont trigger a persistance.
    expect(store.state.count).toEqual(1)
    expect(storage.get("state")).toBeUndefined()

    store.dispatch("decrement") // Modifications will be allowed to be persisted, but wont trigger a persistance.
    expect(store.state.count).toEqual(0)
    expect(storage.get("state")).toBeUndefined()

    store.dispatch("increment2") // Modifications will NOT be allowed to be persisted, but WILL trigger a persistance.
    expect(store.state.count2).toEqual(1)
    expect(storage.get("state").count2).toBeUndefined()
    expect(storage.get("state").count).toEqual(0)

    store.dispatch("decrement2") // Modifications will NOT be allowed to be persisted, AND will NOT trigger a persistance.
    expect(store.state.count2).toEqual(0)
    expect(storage.get("state").count2).toBeUndefined()
    expect(store.state.count).toEqual(0)
    expect(storage.get("state").count).toEqual(0)
  })
})
