# Simplified State

Sstate store is a simplified take on state management. Setting up your store is easy and its API easy to use. State can be modified directly with `setState` or predefined actions which can be executed with `exec`. To have control over how the state is modified its recommended to make use of actions to modify your state.
You can also `subscribe` to state changes of parts of your state, which is a efficient way to act on change. If a parent subscription should be notified is up to you.

Sstate does not dictate how to use state management within your application; you can work with with a single store or have more smaller stores. Stores can even `subscribe` to other changes of other stores. Its up to you.

> NEW! as of 1.4.0 you can have [setState](#setstate) trigger parent subscriptions.

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
const alertParentSubscriptions = true;

CarStore.setState("brands", ["audi"].concat(CarStore.getState("brands")));
CarStore.setState("brands", previous => ["audi"].concat(previous), alertParentSubscriptions);
```

The setState method will do a simple diff between the old value and the newly given value and if they are equal, the state is left unchanged and subscribers will not be notified of any changes. setState does not do any validation on types. If you decide to change the type of value, setState will always allow it. If you want to make sure you have more control over the way the state is changed, please define a action and build your logic there.

After calling setState the state is updated. Without a subscription or requesting the latest state, this will not automatically be reflected somewhere.

> You can now also make sure parent subscribers are a called upon a change, by passing it as the third argument of the **setState** method

**Syntax:**

```javascript
const alertParentSubscriptions = true;

setState(path, newValue);
setState(path, previousValue => previousValue + 1);
// Now parents subscriptions for the given child path will also be triggered on update
setState(path, newValue, alertParentSubscriptions);
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
        const alertParentSubscriptions = false; // which is the default
        setState(type, { ...state[type], ...data }, alertParentSubscriptions);
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
| 1.2.6   | Fixed an issue with the pre-install script, causing package install failures     |
| 1.3.0   | Modified `setState` to also accept a method which gives you access to the previous value. Cleaned up the API     |
| 1.3.1   | Removed deepClone call from set/unset. Updated docs.                             |
| 1.3.2   | Added eslint. Fix small linting issue                                            |
| 1.4.0   | Added the posibility to alert parent subscription of child changes               |
| 1.4.1   | Changed the published files. Still working on the ES decorators...               |
| 1.4.2   | Added compression                                                                |
