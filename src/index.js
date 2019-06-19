let state;
let Listeners;

/**
 * Helper method to get the value of a nested object property.
 * @param {*} root 
 * @param {*} key 
 */
const get = (root, key) => key.split('.').reduce((acc, current) => acc[current], root);

/**
 * Helper method to set value of a nested object property.
 * @param {*} root 
 * @param {*} key 
 * @param {*} val 
 */
const set = (root, key, val) => {
    const keyParts = key.split('.');
    const length = keyParts.length;
    for (let i = 0; i < length - 1; i++) {
        const currentKey = keyParts[i];
        if (!root[currentKey]) root[currentKey] = {}
        root = root[currentKey];
    }
    root[keyParts[length - 1]] = val;
};

/**
 * Helper method for adding/removing the eventListener for your subscription(s).
 * @param {*} storeEl 
 * @param {*} unique 
 * @param {*} key 
 * @param {*} cb 
 */
const bind = (Listeners, unique, key, cb) => {
    const callback = ({ next, previous }) => cb(next, previous);
    if (!Listeners[key]) Listeners[key] = {};
    if (!cb && Listeners[key] && Listeners[key][unique]) {
        delete Listeners[key][unique];
    } else {
        Listeners[key][unique] = callback;
    }
}
const unbind = (Listeners, unique, key) => bind(Listeners, unique, key);

/**
 * Helper method to trigger all listening callbacks
 * @param {*} Listeners 
 * @param {*} key 
 * @param {*} next 
 * @param {*} previous 
 */
const trigger = (Listeners, key, next, previous) => {
    if (!Listeners[key]) return;
    Object.keys(Listeners[key]).forEach(unique => {
        Listeners[key][unique]({ next, previous });
    });
};

/**
 * Sstate simplified store
 */
class Sstate {
    constructor(initialState) {
        state = initialState || {};
        Listeners = {};
    }
    setState(key, next) {
        const previous = this.getState(key);
        if (JSON.stringify(next) !== JSON.stringify(previous)) {
            set(state, key, next);
            trigger(Listeners, key, next, previous);
        }
    }
    subscribe(unique, key, cb) {
        bind(Listeners, unique, key, cb);
    }
    unsubscribe(unique, key) {
        unbind(Listeners, unique, key);
    }
    getState(key) {
        return key === undefined ? state : get(state, key);
    }
}

export default Sstate;
export { Sstate };