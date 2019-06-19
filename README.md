# Sstate

Sstate is a simplified take on state management. You can easily setup your own store and start adding state, subscribing to parts of the state or request the complete state.

## Changelog

| Version | Changes                     |
| ------- | --------------------------- |
| 0.1.0   | Initial version of Sstate |
| 0.2.0   | Improved subscription to not rely on a DOM node for more Generic use |


## Example

**Store.js**

```
import { Sstate } from 'sstate';

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
export { FoodStore }
```

**BreadView.js**

```
import { FoodStore } from 'Store'; 

FoodStore.subscribe('bread', 'bread.wholeWeat', (newValue, oldValue) => {
    console.log(`Prices on Whole Wheat bread have gone ${newValue > oldValue ? 'up' : 'down'}`);
});

FoodStore.setState('bread.wholeWeat', 4);
FoodStore.setState('bread.wholeWeat', 2);
FoodStore.unsubscribe('bread', 'bread.wholeWeat')

// This will not be logged anymore, but the actual state did change.
FoodStore.setState('bread.wholeWeat', 6);

// To validate if our Whole Weat bread has been updated to 6, we can call the following:
console.log(FoodStore.getState('bread.wholeWeat'));

// Now if we request the whole state we just do as following
console.log(FoodStore.getState());
```

## API

You can create a new store with a initial state, by passing a state object into the constructor.

```
const initialState = { 
    brands: ['volvo', 'ford' ], 
    sales: {
        volvo: 231,
        ford: 92
    }
};
const CarStore = new Sstate(initialState);
```

### setState
From the moment we have a store instance, we can start to manipulate the state by using `setState` on the store instance.

```
const currentBrands = CarStore.getState('brands');
CarStore.setState('brands', currentBrands.push('audi') );
```

The setState method will do a simple diff between the old value and the newly given value and if they are equal, the state is left unmodified and subscribers will not be notified of any changes.

After calling setState the state is updated. Without a subscription or requesting the latest state, this will not automatically be reflected somewhere.

`setState( path, newValue )`

### getState

In the previous example we already see that you can get a propery from the initial state by calling `getState` on the store instance. The getState allows for easy access to deeper nested properties like so:

```
CarStore.getState('sales.ford');
```

`getState( path )` 

### subscribe

Subscription is a nice way to listen to specific changes on the state. By subscription you specify a **subscription ID**, **the path** (same as with the `getState` method) and last but not least **a callback method**, which will be passed two values, the new value and the previous value.

```
CarStore.subscribe('fordSalesCard', 'sales.ford', (new, old) => {
    FordSalesCard.enablePromotion = new < old;
});
```

`subscribe( subscriptionId, path, callback )`

### unsubscribe

So a specific property from the state can be subscribed to from many places. Making sure we only `unsubscribe` from those places we mean to do we need to tell the method both the **subscription ID** and **the path**.

```
CarStore.unsubscribe('fordSalesCard', 'sales.ford');
```

From that moment on the subscription is destroyed and the callback will no longer by triggered.

`unsubscribe( subscriptionId, path )`
