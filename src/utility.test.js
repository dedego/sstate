import { deepClone, uuid, get, set, unset } from "./utility";

let obj;
describe("Sstate scenarios", () => {
  beforeEach(() => {
    obj = {
      some: {
        nested: {
          props: true
        }
      }
    };
  });

  test("[deepClone] test cloning functionality", () => {
    let a = {
      s: "string",
      a: ["some", "array"],
      o: { nested: "object" },
      f: () => "function definition",
      d: new Date()
    };

    const b = deepClone(a);

    a.s = ["changed", "it", "to", "an", "array"];

    // The deepcopy should still contain the copies and not a reference
    expect(typeof b.s).toBe("string");
    expect(b.a instanceof Array).toBeTruthy();
    expect(b.o instanceof Object).toBeTruthy();
    expect(b.f instanceof Function).toBeTruthy();
    expect(b.d instanceof Date).toBeTruthy();

    a.f = () => "some other text";

    // Making sure it is not a reference function
    expect(b.f()).toBe("function definition");
  });

  test("[uuid] Generate 1000 unique IDs", () => {
    let uniqueIds = [];
    for (let i = 0; i < 1000; i++) uniqueIds.push(uuid());
    const filter = (a, i, arr) => arr.indexOf(a) !== arr.lastIndexOf(a);
    expect(uniqueIds.filter(filter)).toBeTruthy();
  });

  test("[get] for intermediate parts of the object", () => {
    expect(get(obj, "some").hasOwnProperty("nested")).toBeTruthy();
    expect(get(obj, "some.nested").hasOwnProperty("props")).toBeTruthy();
    expect(get(obj, "some.nested.props").hasOwnProperty("true")).toBeFalsy();
    // Trying to retrieve a non existing path
    expect(get(obj, "some.nested.foo.bar")).toBeUndefined();
    // Trying to use get with non path like parameters
    expect(get(obj, 23)).toBeUndefined();
    expect(get(obj, "")).toBeUndefined();
    expect(get(obj, null)).toBeUndefined();
    expect(get(obj, undefined)).toBeUndefined();
    expect(get(obj, [])).toBeUndefined();
    expect(get(obj, {})).toBeUndefined();
    expect(get(obj, () => "some.nested")).toBeUndefined();
    expect(
      get(
        obj,
        (() => {
          return "some.nested";
        })()
      )
    ).not.toBeUndefined();
  });

  test("[set] for different levels", () => {
    // Set new non existing path
    obj = set(obj, "some.foo.bar", 123);
    expect(get(obj, "some.foo.bar")).toBe(123);
    // Override existing path
    obj = set(obj, "some.nested", [1, 2, 3]);
    expect(get(obj, "some.nested")).toBeInstanceOf(Array);
    expect(get(obj, "some.nested")).toHaveLength(3);
  });

  test("[unset] for different levels", () => {
    obj = unset(obj, "some.nested.props");
    expect(get(obj, "some.nested.props")).toBeUndefined();
    obj = unset(obj, "some.nested");
    expect(get(obj, "some.nested")).toBeUndefined();
    obj = unset(obj, "some");
    expect(get(obj, "some")).toBeUndefined();

    // Expect all levels to be unset
    expect(Object.keys(obj).length).toBe(0);
  });
});
