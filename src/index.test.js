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

    FoodStore = new Sstate(
      {
        fruit: ["apples", "pears"]
      },
      {
        addFruit: setState => {
          setState("potato", 2);
          setState("potato", 4);
        }
      }
    );
  });

  test("[subscribe]", () => {
    // Testing the ammount of times the callback is called
    const CallbackMock = jest.fn();
    const unsubscribe = CarStore.subscribe(
      "brands.mercedes.sales",
      CallbackMock
    );

    // Testing the subscribe method returning both the next and previous value
    CarStore.subscribe("brands.mercedes.sales", (next, previous) =>
      expect(next).toBeGreaterThan(previous)
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
    expect(CarStore.getState("brands.mercedes.sales")).toBe(20);
  });

  test("[getState]", () => {
    const initialFordModels = CarStore.getState("brands.ford.models").join(",");
    const intermediateState = CarStore.getState("brands.ford");

    expect(initialFordModels).toBe("fiesta,cmax");
    expect(intermediateState).toBeInstanceOf(Object);
    expect(intermediateState.models).toBeInstanceOf(Array);

    CarStore.getState().brands = null;

    expect(CarStore.getState("brands")).not.toBeNull();
  });

  test("[setState]", () => {
    // Setting state on a path that does not exist yet, will just create it.
    CarStore.setState("mercedes.sales", 100);

    // The initial state remains unmodified.
    expect(CarStore.getState("brands.mercedes.sales")).toBe(7);
    // The new state is added.
    expect(CarStore.getState("mercedes.sales")).toBe(100);

    const fullState = CarStore.getState();
    // Expect the root state object to have two keys `brands` and `mercedes`.
    expect(Object.keys(fullState).length).toBe(2);

    // Making sure deepClone does not destroy date instances.
    CarStore.setState("mercedes.lastSale", new Date());
    expect(CarStore.getState("mercedes.lastSale")).toBeInstanceOf(Date);

    expect(CarStore.getState("brands.ford.models")).toHaveLength(2);
    CarStore.setState("brands.ford.models", previous => ["mustang"].concat(previous));
    expect(CarStore.getState("brands.ford.models")).toHaveLength(3);
  });

  test("[exec]", () => {
    const ChainMock = jest.fn();
    const ExecStore = new Sstate(
      {
        executions: 0,
        state: undefined
      },
      {
        doSome: (setState, state, args) => {
          setState("executions", state.executions + 1);
          setState("state", Math.random());

          // Cannot mutate state on the state object
          state.executions = 10;

          // Expect the passed arguments to be undefined
          expect(args).toBeUndefined();
        },
        doSomeWithArgs: (setState, state, { key, value }) => {
          setState(key, value);
        },
        notAFunction: true,
        chain: ChainMock
      }
    );

    const s = () => ExecStore.getState("state");
    let state = s();

    expect(ExecStore.getState("executions")).toBe(0);

    ExecStore.exec("doSome");
    expect(state).not.toBe(s());
    state = s();

    ExecStore.exec("doSome");
    expect(state).not.toBe(s());
    state = s();

    ExecStore.exec("doSome");
    expect(state).not.toBe(s());
    state = s();

    ExecStore.exec("doSomeWithArgs", {
      key: "withArgs",
      value: true
    });

    expect(() => {
      ExecStore.exec("notAFunction");
    }).toThrow(
      "The requested action: notAFunction is not a executable function"
    );
    expect(() => {
      ExecStore.exec("nonExistingFunction");
    }).toThrow("The requested action: nonExistingFunction does not exist");

    expect(ExecStore.getState("executions")).toBe(3);
    expect(ExecStore.getState("withArgs")).toBeTruthy();

    // Chaining executions
    ExecStore.exec("chain")
      .exec("doSome")
      .exec("chain")
      .exec("doSome")
      .exec("chain");
    expect(ChainMock).toHaveBeenCalledTimes(3);
  });

  test("Multiple stores", () => {
    const FSMock = jest.fn();
    const CSMock = jest.fn();
    const ACTIONMock = jest.fn();

    const usFS = FoodStore.subscribe("fruit", FSMock);
    const usAFS = FoodStore.subscribe("potato", ACTIONMock);
    const usCS = CarStore.subscribe("brands.mercedes.sales", CSMock);

    CarStore.setState("brands.mercedes.sales", 8);
    CarStore.setState("brands.mercedes.sales", 11);
    CarStore.setState("brands.mercedes.sales", 17);

    FoodStore.setState(
      "fruit",
      ["bananas"].concat(FoodStore.getState("fruit"))
    );
    FoodStore.setState("fruit", previous => ["mangos"].concat(previous));

    // Execute action
    FoodStore.exec("addFruit");

    expect(FSMock).toHaveBeenCalledTimes(2);
    expect(CSMock).toHaveBeenCalledTimes(3);

    FoodStore.setState("fruit", ["kiwis"].concat(FoodStore.getState("fruit")));
    CarStore.setState("brands.mercedes.sales", 21);
    CarStore.setState("brands.mercedes.sales", 25);

    usFS();
    usCS();

    expect(FSMock).toHaveBeenCalledTimes(3);
    expect(CSMock).toHaveBeenCalledTimes(5);
    expect(ACTIONMock).toHaveBeenCalledTimes(2);

    expect(FoodStore.getState("potato")).toBe(4);
  });
});
