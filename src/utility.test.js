import { get, set, unset } from "./utility";

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
