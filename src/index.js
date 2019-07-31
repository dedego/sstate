import { deepClone, uuid, get, set, unset } from "./utility";

const Errors = {
  invalid_key: key => `The key can only be a string, you passed a ${typeof key}`,
  not_existing: name => `The requested action: ${name} does not exist`,
  not_function: name => `The requested action: ${name} is not a executable function`
}

class Sstate {
  constructor(
    initialState = {},
    actions = {}
  ) {
    this.__state = initialState;
    this.__subscribers = {};
    this.__actions = actions;
  }
  get __actions() {
    return deepClone(this.__sstate__actions);
  }
  get __state() {
    return deepClone(this.__sstate__state);
  }
  get __subscribers() {
    return deepClone(this.__sstate__subscribers);
  }
  set __actions(newActions) {
    this.__sstate__actions = deepClone(newActions);
  }
  set __state(newState) {
    this.__sstate__state = deepClone(newState);
  }
  set __subscribers(newSubscribers) {
    this.__sstate__subscribers = deepClone(newSubscribers);
  }
  exec(name, args) {
    const action = this.__sstate__actions[name];
    if (!action) throw Errors.not_existing(name);
    if (typeof action !== "function") throw Errors.not_function(name);
    action(this.setState.bind(this), this.__state, args);
    return this;
  }
  getState(key) {
    return !key ? this.__state : get(this.__state, key);
  }
  setState(key, nextValue) {
    if(typeof key !== "string") throw Errors.invalid_key(key);
    const previous = this.getState(key);
    const next = typeof nextValue === "function" ? nextValue(previous) : nextValue;
    if (JSON.stringify(next) !== JSON.stringify(previous)) {
      this.__state = set(this.__sstate__state, key, next);
      const subscriptionsForKey = get(this.__subscribers, key);
      if (!subscriptionsForKey) return;
      Object.keys(subscriptionsForKey).forEach(unique => {
        subscriptionsForKey[unique](next, previous);
      });
    }
  }
  subscribe(key, cb) {
    const id = `${key}.${uuid()}`;
    this.__subscribers = set(this.__subscribers, id, cb);
    return () => (this.__subscribers = unset(this.__subscribers, id));
  }
}

export default Sstate;
export { Sstate };
