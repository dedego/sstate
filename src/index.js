import { uuid, get, set, unset } from "./utility";

class Sstate {
  constructor(initialState = {}, actions = {}) {
    this.__sstate__state = initialState;
    this.__sstate__subscribers = {};
    this.__sstate__actions = actions;
  }
  exec(name) {
    const action = this.__sstate__actions[name];
    if (!action) return;
    const setState = this.setState.bind(this);
    const state = Object.assign({}, this.__sstate__state)
    action(setState, state);
  }
  getState(key) {
    return key === undefined
      ? Object.assign({}, this.__sstate__state)
      : get(this.__sstate__state, key);
  }
  setState(key, next) {
    const previous = this.getState(key);
    if (JSON.stringify(next) !== JSON.stringify(previous)) {
      this.__sstate__state = set(this.__sstate__state, key, next);
      const subscriptionsForKey = get(this.__sstate__subscribers, key);
      if (!subscriptionsForKey) return;
      Object.keys(subscriptionsForKey).forEach(unique => {
        subscriptionsForKey[unique](next, previous);
      });
    }
  }
  subscribe(key, cb) {
    const id = `${key}.${uuid()}}`;
    this.__sstate__subscribers = set(this.__sstate__subscribers, id, cb);
    return () =>
      (this.__sstate__subscribers = unset(this.__sstate__subscribers, id));
  }
}

export default Sstate;
export { Sstate };
