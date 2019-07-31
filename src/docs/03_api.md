## API

You can create a new store with a initial state, by passing a state object into the constructor as the first argument.
If you like to setup predefined actions, you can pass this as the second arguments when creating your store.

```javascript
const CarStore = new Sstate({
  brands: ["volvo", "ford"],
  sales: {
    volvo: 231,
    ford: 92
  }
}, {
  getLatestBrands: (setState, state) => {
    axios.get("/api/brands/latest").then(({ data }) => {
      setState("brands", previous => [...previous, ...data]);
      data.forEach(brand => setState(`sales.${brand}`, previous => previous ? previous : 0));
    });
  }
});
```

### setState

Once we have a store instance, we can start to manipulate the state by using `setState` on the store.
setState has two ways of changing the state. You can pass it a primitive value or you could pass it a method; where the first and only argument is the previous value of the state that you'd like to change.

```javascript
CarStore.setState("brands", ["audi"].concat(CarStore.getState("brands")));
CarStore.setState("brands", previous => ["audi"].concat(previous));
```

The setState method will do a simple diff between the old value and the newly given value and if they are equal, the state is left unchanged and subscribers will not be notified of any changes. setState does not do any validation on types. If you decide to change the type of value, setState will always allow it. If you want to make sure you have more control over the way the state is changed, please define a action and build your logic there.

After calling setState the state is updated. Without a subscription or requesting the latest state, this will not automatically be reflected somewhere.

**Syntax:**

```javascript
setState(path, newValue);
setState(path, previousValue => previousValue + 1);
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

Subscription is a nice way to listen to specific state changes. By providing **a path** (same as with the `getState` method) and **a callback method**, which will be passed two values, the next value and the previous value.

```javascript
const unsubscribeFordSales = CarStore.subscribe('sales.ford', (next, previous) => {
    FordSalesCard.enablePromotion = next < previous;
});

// When it is time to stop listening to the changes, just call:
unsubscribeFordSales();
```

**Syntax:**

```javascript
subscribe(path, callback);
```

### exec 

*Introduced in version 1.1.0*

Actions can be provided as the second argument when initializing the store. 

A action receives three arguments:
- the `setState` method
- the complete state
- arguments (for when you call the `exec` method)

If you want to execute a action, use the `exec` method with the name of the action and optionally parameters as the second argument.

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
ToyStore
  .exec("update", { type: "electric" })
  .exec("update", { type: "wood" });
// The update method prevents the axios call from being made,
// because the type is not allowed.
ToyStore.exec("update", { type: "GARBAGE" });
```

**Syntax:**

```javascript
exec(actionName, args);
```

---
