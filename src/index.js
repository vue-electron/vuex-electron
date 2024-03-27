import createPersistedState from "./persisted-state"
import createSharedMutations from "./shared-mutations"

import { version } from '../package.json'

console.log(`Loaded vuex-electron v${version}`)

export { createPersistedState, createSharedMutations }
