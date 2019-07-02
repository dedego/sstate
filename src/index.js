import { deepClone, uuid, get, set, unset } from "./utility";

class Sstate {
  constructor(initialState = {}, actions = {}) {
    this.__sstate__state = deepClone(initialState);
    this.__sstate__subscribers = {};
    this.__sstate__actions = deepClone(actions);
  }
  exec(name, args) {
    const action = this.__sstate__actions[name];
    if (!action) throw `The requested action: ${name} does not exist`;
    if (typeof action !== "function") throw `The requested action: ${name} is not a executable function`;
    const setState = this.setState.bind(this);
    const state = deepClone(this.__sstate__state);
    action(setState, state, args);
    return this;
  }
  getState(key) {
    const state = deepClone(this.__sstate__state);
    return !key ? state : get(state, key);
  }
  setState(key, next) {
    const previous = this.getState(key);
    if (JSON.stringify(next) !== JSON.stringify(previous)) {
      this.__sstate__state = set(deepClone(this.__sstate__state), key, next);
      const subscriptionsForKey = get(
        deepClone(this.__sstate__subscribers),
        key
      );
      if (!subscriptionsForKey) return;
      Object.keys(subscriptionsForKey).forEach(unique => {
        subscriptionsForKey[unique](next, previous);
      });
    }
  }
  subscribe(key, cb) {
    const id = `${key}.${uuid()}`;
    this.__sstate__subscribers = set(
      deepClone(this.__sstate__subscribers),
      id,
      cb
    );
    return () =>
      (this.__sstate__subscribers = unset(
        deepClone(this.__sstate__subscribers),
        id
      ));
  }
}

export default Sstate;
export { Sstate };
