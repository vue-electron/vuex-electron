import { createPersistedState, createSharedMutations } from "../src"

describe("createPersistedState", () => {
  it("function", () => {
    expect(createPersistedState).toBeInstanceOf(Function)
  })

  it("returns function", () => {
    expect(createPersistedState()).toBeInstanceOf(Function)
  })
})

describe("createSharedMutations", () => {
  it("function", () => {
    expect(createSharedMutations).toBeInstanceOf(Function)
  })

  it("returns function", () => {
    expect(createSharedMutations()).toBeInstanceOf(Function)
  })
})
