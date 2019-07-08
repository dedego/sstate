# Sstate

Sstate is a simplified take on state management. You can easily setup your own store and start adding state, execution predefined actions, subscribing to parts of the state and request the complete state.

1. [Getting started](#getting-started)
   1. [Example](#example)
2. [API](#api)
   1. [setState](#setstate)
   2. [getState](#getstate)
   3. [subscribe](#subscribe)
   4. [exec](#exec)
3. [Changelog](#changelog)

---
## Getting started

Install the dependency: 
```
npm i sstate --save
```

Have a look at the example to get a idea on how to use the sstate store. You can also have a look here for the react wrapper [react-sstate](https://www.npmjs.com/package/react-sstate).

### Example

**Store.js**

```javascript
import { Sstate } from "sstate";

const FoodStore = new Sstate(
  {
    stock: {
      bread: {
        baguette: 4,
        wholeWeat: 3
      },
      fruit: {
        apples: 0.5,
        bananas: 1
      }
    }
  },
  {
    updateStock: (setState, state, { country }) => {
      const params = { country };
      axios
        .get("/api/stock", { params })
        .then(({ data }) => setState("stock", data));
    }
  }
);

export default FoodStore;
export { FoodStore };
```

**BreadView.js**

```javascript
import { FoodStore } from "Store";

const unsubscribe = FoodStore.subscribe(
  "stock.bread.wholeWeat",
  (newValue, oldValue) => {
    console.log(
      `Prices on Whole Wheat bread have gone ${
        newValue > oldValue ? "up" : "down"
      }`
    );
  }
);

FoodStore.setState("stock.bread.wholeWeat", 4);
FoodStore.setState("stock.bread.wholeWeat", 2);
unsubscribe();

// This will not be logged anymore, but the actual state did change.
FoodStore.setState("stock.bread.wholeWeat", 6);

// To validate if our Whole Weat bread has been updated to 6, we can call the following:
console.log(FoodStore.getState("stock.bread.wholeWeat"));

// Now if we request the whole state we just do as following
console.log(FoodStore.getState());

// To update the stock from the API, we can call our defined action `updateStock`
FoodStore.exec("updateStock", { country: "NL" });
```

---
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
## Changelog

| Version | Changes                                                                          |
| ------- | -------------------------------------------------------------------------------- |
| 0.1.0   | Initial version of Sstate                                                        |
| 0.2.0   | Improved subscription to not rely on a DOM node for more Generic use             |
| 0.2.1   | Fixed the getState in case it is called with a non existing path                 |
| 0.3.0   | Allow for eassier unsubscribe, see [subscribe](#subscribe)                       |
| 1.0.0   | Simplified the API, removed unsubscribe, removed unique subscriptionId           |
| 1.0.1   | Removed unsubscribe from the example                                             |
| 1.0.2   | Improved unset, fixed documentation, added utility tests                         |
| 1.0.3   | Replaced microbundle in favor of rollup                                          |
| 1.0.4   | Replaced CJS by UMD build only                                                   |
| 1.0.5   | Corrected the subscription callback method, changed the UUID generation          |
| 1.1.0   | Introduced [actions](#exec)                                                      |
| 1.1.1   | Fixed the state returned in getState and the action(s) to be immutable           |
| 1.1.2   | Fixed typo in the unique keys for subscription, added aditional info on getState |
| 1.2.0   | Added parameters for `exec`, which are accessable in your actions                |
| 1.2.1   | Changed object.assign to deepClone to make sure we dont deal with references     |
| 1.2.2   | Improved validation of the action before execution                               |
| 1.2.3   | Allow chaining of `exec`ution of actions                                         |
| 1.2.4   | Moved to GitHub                                                                  |
| 1.2.5   | Corrected repo in package.json, corrected description                            |
