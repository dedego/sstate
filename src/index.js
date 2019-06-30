import { uuid, get, set, unset } from "./utility";

class Sstate {
  constructor(initialState) {
    this.__sstate__state = initialState || {};
    this.__sstate__subscribers = {};
  }
  getState(key) {
    return key === undefined
      ? this.__sstate__state
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
