# Vuex Electron

This package is still in development. But you can already use it because production build will be released soon. Approximately in early October 2018.

### Features

- [x] Persisted state
- [x] Shared mutations between all processes

### Example

Installing of the Vuex Electron easy as 1-2-3.

Just add such lines into your Vuex store:

```javascript
import Vue from "vue"
import Vuex from "vuex"

import { createPersistedState, createSharedMutations } from "vuex-electron"

Vue.use(Vuex)

export default new Vuex.Store({
  // ...
  plugins: [
    createPersistedState(),
    createSharedMutations()
  ],
  // ...
})
```

### IMPORTANT

> For proper working of such package, you shouldn't use `store.commit` outside of actions.

### Options

Available options for `createPersistedState()`

```javascript
createPersistedState({
  whitelist: ["whitelistedAction", "anotherWhitelistedAction"],
  
  // or
  
  whitelist: (mutation) => {
    return true
  },
  
  // or
  
  blacklist: ["ignoredAction", "anotherIgnoredAction"],
  
  // or
  
  blacklist: (mutation) => {
    return true
  }
})
```

## Development Roadmap

- [ ] Configure ESLint and Prettier
- [ ] Minify package
- [ ] Write tests
- [ ] Write docs
