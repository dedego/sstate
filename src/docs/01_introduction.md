# Sstate

Sstate is a simplified take on state management. Setting up your store is easy and its API easy to use. State can be modified directly with `setState` or predefined actions which can be executed with `exec`. To have control over how the state is modified its recommended to make use of actions to modify your state.
You can also `subscribe` to state changes of parts of your state, which is a efficient way to act on change.

Sstate does not dictate how to use state management within your application; you can work with with a single store or have more smaller stores. Stores can even `subscribe` to other changes of other stores. Its up to you.

1. [Getting started](#getting-started)
   1. [Example](#example)
2. [API](#api)
   1. [setState](#setstate)
   2. [getState](#getstate)
   3. [subscribe](#subscribe)
   4. [exec](#exec)
3. [Changelog](#changelog)

---
