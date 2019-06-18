((win) => {
    let state;
    let storeEl;
    let Listeners = {};

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
    const ev = (storeEl, unique, key, cb) => {
        const callback = ({ detail }) => cb(detail.new, detail.previous);
        if (cb) Listeners[unique] = callback;
        storeEl[!cb ? 'removeEventListener' : 'addEventListener'](`Sshtate.${key}`, !cb ? Listeners[unique] : callback);
        if (!cb) delete Listeners[unique];
    }

    /**
     * Sshtate simplified store
     */
    class Sshtate {
        constructor(initialState) {
            storeEl = document.createElement('meta');
            state = initialState || {};
        }
        setState(key, val) {
            const currentState = this.getState(key);
            if (JSON.stringify(val) !== JSON.stringify(currentState)) {
                set(state, key, val);
                storeEl.dispatchEvent(new CustomEvent(`Sshtate.${key}`, {
                    bubbles: true,
                    detail: { new: val, previous: currentState }
                }));
            }
        }
        subscribe(unique, key, cb) {
            ev(storeEl, unique, key, cb);
        }
        unsubscribe(unique, key, cb) {
            ev(storeEl, unique, key);
        }
        getState(key) {
            return key === undefined ? state : get(state, key);
        }
    }

    win.Sshtate = Sshtate;
})(window);