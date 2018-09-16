<p align="center">
  <img width="750" src="https://user-images.githubusercontent.com/678665/45566726-404d9e80-b860-11e8-94b6-527dfcc3b3b3.png">
</p>

# Vuex Electron

[![Travis](https://img.shields.io/travis/com/vue-electron/vuex-electron.svg?style=flat-square)](https://travis-ci.com/vue-electron/vuex-electron)
[![Code Climate](https://img.shields.io/codeclimate/maintainability/vue-electron/vuex-electron.svg?style=flat-square)](https://codeclimate.com/github/vue-electron/vuex-electron)
[![Code Climate](https://img.shields.io/codeclimate/coverage/vue-electron/vuex-electron.svg?style=flat-square)](https://codeclimate.com/github/vue-electron/vuex-electron)
[![Code Style Prettier](https://img.shields.io/badge/code%20style-prettier-brightgreen.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Made With Love](https://img.shields.io/badge/made%20with-love-brightgreen.svg?style=flat-square)](https://github.com/MrEmelianenko)

The easiest way to use your Vuex store between all processes (including main).

### Features

:star: Persisted state  
:star: Shared mutations

### Requirements

- [Vue](https://github.com/vuejs/vue) v2.0+
- [Vuex](https://github.com/vuejs/vuex) v2.0+
- [Electron](https://github.com/electron/electron) v2.0+

### Installation

Installation of the Vuex Electron easy as 1-2-3.

1. Install package with using of [yarn](https://github.com/yarnpkg/yarn) or [npm](https://github.com/npm/cli):

    ```
    yarn install vuex-electron
    ```

    or

    ```
    npm install vuex-electron
    ```

2. Include plugins in your Vuex store::

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

#### IMPORTANT

> For proper work of the package, you shouldn't use `store.commit` outside of actions.

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

- [x] Configure ESLint and Prettier
- [x] Configure Travis CI and CodeClimate
- [x] Minify package
- [ ] Write tests
- [ ] Write docs
