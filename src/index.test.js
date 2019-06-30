import { Sstate } from "./index";

let CarStore;
let FoodStore;
describe("Sstate scenarios", () => {
  beforeEach(() => {
    // Setting up initial state
    CarStore = new Sstate({
      brands: {
        ford: {
          models: ["fiesta", "cmax"],
          sales: 3
        },
        mercedes: {
          models: ["a-class", "b-class", "c-class"],
          sales: 7
        }
      }
    });

    FoodStore = new Sstate({
      fruit: ["apples", "pears"]
    });
  });

  test("Sstate subscribe/unsubscribe", () => {
    const CallbackMock = jest.fn();
    const unsubscribe = CarStore.subscribe(
      "brands.mercedes.sales",
      CallbackMock
    );
    // Adding sales for Mercedes
    CarStore.setState("brands.mercedes.sales", 8);
    CarStore.setState("brands.mercedes.sales", 11);
    CarStore.setState("brands.mercedes.sales", 12);
    CarStore.setState("brands.mercedes.sales", 13);
    // Entries with the same value, should not update the state or call the subscriber callback.
    CarStore.setState("brands.mercedes.sales", 13);
    // Adding a sale for Ford, which should not be included, as the subscribed property is from Mercedes.
    CarStore.setState("brands.ford.sales", 18);

    unsubscribe();

    expect(CallbackMock).toHaveBeenCalledTimes(4);

    CarStore.setState("brands.mercedes.sales", 19);
    CarStore.setState("brands.mercedes.sales", 20);

    expect(CallbackMock).toHaveBeenCalledTimes(4);
  });

  test("Sstate subscribe with unsubscribe returned from the subscribe method", () => {
    const CallbackMock = jest.fn();
    const unsubscribe = CarStore.subscribe("brands.ford.sales", CallbackMock);

    // Adding sales for Ford.
    CarStore.setState("brands.ford.sales", 8);

    expect(CallbackMock).toHaveBeenCalledTimes(1);

    // A convenient way of unsubscribing.
    unsubscribe();

    // Adding sales for Ford.
    CarStore.setState("brands.ford.sales", 9);
    CarStore.setState("brands.ford.sales", 11);

    expect(CallbackMock).toHaveBeenCalledTimes(1);
  });

  test("Sstate getState", () => {
    const initialFordModels = CarStore.getState("brands.ford.models").join(",");
    expect(initialFordModels).toBe("fiesta,cmax");

    const intermediateState = CarStore.getState("brands.ford");
    expect(intermediateState).toBeInstanceOf(Object);
    expect(intermediateState.models).toBeInstanceOf(Array);
  });

  test("Sstate setState", () => {
    // Setting state on a path that does not exist yet, will just create it.
    CarStore.setState("mercedes.sales", 100);

    // The initial state remains unmodified.
    expect(CarStore.getState("brands.mercedes.sales")).toBe(7);
    // The new state is added.
    expect(CarStore.getState("mercedes.sales")).toBe(100);

    const fullState = CarStore.getState();
    // Expect the root state object to have two keys `brands` and `mercedes`.
    expect(Object.keys(fullState).length).toBe(2);
  });

  test("Multiple stores", () => {
    const FSMock = jest.fn();
    const CSMock = jest.fn();

    const usFS = FoodStore.subscribe("fruit", FSMock);
    const usCS = CarStore.subscribe("brands.mercedes.sales", CSMock);

    CarStore.setState("brands.mercedes.sales", 8);
    CarStore.setState("brands.mercedes.sales", 11);
    CarStore.setState("brands.mercedes.sales", 17);

    FoodStore.setState(
      "fruit",
      ["bananas"].concat(FoodStore.getState("fruit"))
    );
    FoodStore.setState("fruit", ["mangos"].concat(FoodStore.getState("fruit")));

    expect(FSMock).toHaveBeenCalledTimes(2);
    expect(CSMock).toHaveBeenCalledTimes(3);

    FoodStore.setState("fruit", ["kiwis"].concat(FoodStore.getState("fruit")));
    CarStore.setState("brands.mercedes.sales", 21);
    CarStore.setState("brands.mercedes.sales", 25);

    usFS();
    usCS();

    expect(FSMock).toHaveBeenCalledTimes(3);
    expect(CSMock).toHaveBeenCalledTimes(5);
  });
});
