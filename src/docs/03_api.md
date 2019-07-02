## API

You can create a new store with a initial state, by passing a state object into the constructor.
The second argument is an object with action definitions like the example below.

```javascript
const initialState = {
  brands: ["volvo", "ford"],
  sales: {
    volvo: 231,
    ford: 92
  }
};
const actions = {
  getLatestBrands: (setState, state) => {
    axios.get("/api/brands/latest").then(({ data }) => {
      setState("brands", state.brands.concat(data));
    });
  }
};
const CarStore = new Sstate(initialState, actions);
```

### setState

From the moment we have a store instance, we can start to manipulate the state by using `setState` on the store instance.

```javascript
CarStore.setState("brands", ["audi"].concat(CarStore.getState("brands")));
```

The setState method will do a simple diff between the old value and the newly given value and if they are equal, the state is left unmodified and subscribers will not be notified of any changes.

After calling setState the state is updated. Without a subscription or requesting the latest state, this will not automatically be reflected somewhere.

**Syntax:**

```javascript
setState(path, newValue);
```

### getState

In the previous example we already see that you can get a propery from the initial state by calling `getState` on the store instance. The getState allows for easy access to deeper nested properties like so:

```javascript
CarStore.getState("sales.ford");
```

`getState` can also be called without a path to retrieve the complete state object.

**Syntax:**

```javascript
getState();
getState(path);
```

### subscribe

Subscription is a nice way to listen to specific changes on the state. By providing **a path** (same as with the `getState` method) and **a callback method**, which will be passed two values, the new value and the previous value.

```javascript
const unsubscribeFordSales = CarStore.subscribe('sales.ford', (new, old) => {
    FordSalesCard.enablePromotion = new < old;
});

// When it is time to stop listening to the changes, just call:
unsubscribeFordSales();
```

**Syntax:**

```javascript
subscribe(path, callback);
```

### exec

As of version 1.1.0 there is the concept of actions that can be executed on the store which will result in a modified state.
Actions can be provided as the second argument when initializing the store. At the moment of execution, the first argument gives
you access to the `setState` method, the second argument gives you the complete state and the third argument allows for passing allong parameters.

When calling the `exec` method, the first argument refers to the predefined action, the second argument can be used to pass along parameters.

You can chain multiple actions in a single line (see example).

> If you try to execute a action that is not defined when creating the store, a error will be thrown. If the type of action that is defined, is not a function a error will be thrown.

```javascript
const ToyStore = new Sstate(
  {
    electric: {
      trains: 14,
      automobile: 55,
      powertools: 7
    },
    wood: {
      bicycle: 2,
      blocks: 12
    }
  },
  {
    update: (setState, state, { type }) => {
      if (!["wood", "electric"].includes(type)) return;
      axios.get(`/api/getStock/${type}`).then(({ data }) => {
        setState(type, { ...state[type], ...data });
      });
    }
  }
);

// Now the "update" action is available through the `exec` method
ToyStore.exec("update", { type: "electric" }).exec("update", { type: "wood" });
// The update method prevents the axios call from being made,
// because the type is not allowed.
ToyStore.exec("update", { type: "GARBAGE" });
```

**Syntax:**

```javascript
exec(actionName, args);
```

---