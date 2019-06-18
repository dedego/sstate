# Sshtate

Sshtate is a simplified take on state management. The library has the benefit that you can listen to changes for specific parts
of the state. The example below, gives you a bit of an idea how it works.

```
import { Sshtate } from 'sshtate';

const initialState = { bread: { baguette: 2, loaf: 6 }, fruit: { apples: 11, bananas: 1 } };
const FoodStore = new Sshtate( initialState );

FoodStore.subscribe('subscriptionId', 'bread.loaf', (newValue, previousValue) => {
    console.log(newValue, previousValue);
});

FoodStore.setState('bread.loaf', 22); // Will log 22 as the new value and 6 as the old
FoodStore.setState('bread.loaf', 24); // Will log 24 as the new value and 22 as the old

// Will log the complete state
console.log( FoodStore.getState() );
// Will log the specific part of the state
console.log( FoodStore.getState('fruit.apples') );

setTimeout(() => {
    // Will remove the subscription based on the subscription ID and the given path.
    FoodStore.unsubscribe('subscriptionId', 'bread.loaf') 
}, 10000);
```
