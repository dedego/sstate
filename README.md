# Sstate

Sstate is a simplified take on state management. You can easily setup your own store and start adding state, subscribing to parts of the state or request the complete state.

1. [Getting started](#getting-started)
   1. [Example](#example)
2. [API](#api)
   1. [setState](#setState)
   2. [getState](#getState)
   3. [subscribe](#subscribe)
   4. [unsubscribe](#unsubscribe) _removed in v1.0.0_
3. [Changelog](#changelog)

## Getting started

`npm i sstate --save`

You can also have a look here for the react wrapper [react-sstate](https://www.npmjs.com/package/react-sstate).

### Example

**Store.js**

```javascript
import { Sstate } from "sstate";

const FoodStore = new Sstate({
  bread: {
    baguette: 4,
    wholeWeat: 3
  },
  fruit: {
    apples: 0.5,
    bananas: 1
  }
});

export default FoodStore;
export { FoodStore };
```

**BreadView.js**

```javascript
import { FoodStore } from "Store";

const unsubscribe = FoodStore.subscribe(
  "bread.wholeWeat",
  (newValue, oldValue) => {
    console.log(
      `Prices on Whole Wheat bread have gone ${
        newValue > oldValue ? "up" : "down"
      }`
    );
  }
);

FoodStore.setState("bread.wholeWeat", 4);
FoodStore.setState("bread.wholeWeat", 2);
unsubscribe();

// This will not be logged anymore, but the actual state did change.
FoodStore.setState("bread.wholeWeat", 6);

// To validate if our Whole Weat bread has been updated to 6, we can call the following:
console.log(FoodStore.getState("bread.wholeWeat"));

// Now if we request the whole state we just do as following
console.log(FoodStore.getState());
```

## API

You can create a new store with a initial state, by passing a state object into the constructor.

```javascript
const initialState = {
  brands: ["volvo", "ford"],
  sales: {
    volvo: 231,
    ford: 92
  }
};
const CarStore = new Sstate(initialState);
```

### setState

From the moment we have a store instance, we can start to manipulate the state by using `setState` on the store instance.

```javascript
CarStore.setState("brands", ["audi"].concat(CarStore.getState("brands")));
```

The setState method will do a simple diff between the old value and the newly given value and if they are equal, the state is left unmodified and subscribers will not be notified of any changes.

After calling setState the state is updated. Without a subscription or requesting the latest state, this will not automatically be reflected somewhere.

`setState( path, newValue )`

### getState

In the previous example we already see that you can get a propery from the initial state by calling `getState` on the store instance. The getState allows for easy access to deeper nested properties like so:

```javascript
CarStore.getState("sales.ford");
```

`getState( path )`

### subscribe

Subscription is a nice way to listen to specific changes on the state. By providing **a path** (same as with the `getState` method) and **a callback method**, which will be passed two values, the new value and the previous value.

```javascript
const unsubscribeFordSales = CarStore.subscribe('sales.ford', (new, old) => {
    FordSalesCard.enablePromotion = new < old;
});

// When it is time to stop listening to the changes, just call:
unsubscribeFordSales();
```

`subscribe( path, callback )`

### unsubscribe

Unsubscribe was removed as of version 1.0.0, use the returned function from subscription to unsubscribe.

## Changelog

| Version | Changes                                                                |
| ------- | ---------------------------------------------------------------------- |
| 0.1.0   | Initial version of Sstate                                              |
| 0.2.0   | Improved subscription to not rely on a DOM node for more Generic use   |
| 0.2.1   | Fixed the getState in case it is called with a non existing path       |
| 0.3.0   | Allow for eassier unsubscribe, see [subscribe](#subscribe)             |
| 1.0.0   | Simplified the API, removed unsubscribe, removed unique subscriptionId |
| 1.0.1   | Removed unsubscribe from the example                                   |
| 1.0.2   | Improved unset, fixed documentation, added utility tests               |
| 1.0.3   | Replaced microbundle in favor of rollup                                |
| 1.0.4   | Replaced CJS by UMD build only                                         |
