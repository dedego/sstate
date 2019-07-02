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
