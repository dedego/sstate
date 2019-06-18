((win) => {
    let state;
    let storeEl;
    let Listeners = {};

    const get = (root, key) => key.split('.').reduce((acc, current) => acc[current], root);
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
    const ev = (storeEl, unique, key, cb) => {
        const callback = ({ detail }) => cb(detail);
        if (cb) Listeners[unique] = callback;
        storeEl[!cb ? 'removeEventListener' : 'addEventListener'](`Sshtate.${key}`, !cb ? Listeners[unique] : callback);
        if (!cb) delete Listeners[unique];
    }

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
                    detail: val
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