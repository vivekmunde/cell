import cell from "../lib/es";

describe("cell", () => {
  test("Should check subscriber type to be a function", () => {
    expect.hasAssertions();

    const { subscribe } = cell({});

    const subscriberTypes = [true, 123, "string", Symbol("S"), [1, 2, 3]];

    subscriberTypes.forEach((subscriber) => {
      expect(() => {
        const unsubscribe = subscribe(subscriber);

        unsubscribe();
      }).toThrow(new Error("subscriber must be a function."));
    });
  });

  test("Should check subscriber type to be a function", () => {
    expect.hasAssertions();

    const { subscribe } = cell({});

    const selectorTypes = [true, 123, "string", Symbol("S"), [1, 2, 3]];

    selectorTypes.forEach((selector) => {
      expect(() => {
        const unsubscribe = subscribe(() => {}, selector);

        unsubscribe();
      }).toThrow(new Error("selector must be a function."));
    });
  });

  test("Should check isEqual type to be a function", () => {
    expect.hasAssertions();

    const { subscribe } = cell({});

    const isEqualTypes = [true, 123, "string", Symbol("S"), [1, 2, 3]];

    isEqualTypes.forEach((isEqual) => {
      expect(() => {
        const unsubscribe = subscribe(
          () => {},
          (s) => s,
          isEqual
        );

        unsubscribe();
      }).toThrow(new Error("isEqual must be a function."));
    });
  });

  test("Should return initial state", () => {
    expect.hasAssertions();

    const { subscribe } = cell({ name: "name" });

    const unsubscribe = subscribe((state) => {
      expect(state).toEqual({ name: "name" });
    });

    unsubscribe();
  });

  test("Should return changed state", () => {
    expect.hasAssertions();

    const { subscribe, update } = cell({ name: "x" });

    let expectedState = { name: "x" };

    const unsubscribe = subscribe((state) => {
      expect(state).toEqual(expectedState);
    });

    update(() => {
      expectedState = { name: "y" };

      return { name: "y" };
    });

    unsubscribe();
  });

  test("Should unsubscribe state changes", () => {
    expect.hasAssertions();

    const { subscribe, update } = cell({ name: "x" });

    const subscriber = jest.fn();

    const unsubscribe = subscribe(subscriber);

    update(() => ({ name: "a" }));

    unsubscribe();

    update(() => ({ name: "b" }));
    update(() => ({ name: "c" }));

    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  test("Should set current state as argument", () => {
    expect.hasAssertions();

    const { subscribe, update } = cell({ name: "x" });

    let expectedState = { name: "x" };

    const subscriber = (state) => {
      expect(state).toEqual(expectedState);
    };

    const unsubscribe = subscribe(subscriber);

    update((state) => {
      expectedState = { name: "x" };

      expect(state).toEqual(expectedState);

      expectedState = { name: "y" };

      return { name: "y" };
    });

    update((state) => {
      expectedState = { name: "y" };

      expect(state).toEqual(expectedState);

      expectedState = { name: "z" };

      return { name: "z" };
    });

    unsubscribe();
  });

  test("Should return selected state (I)", () => {
    expect.hasAssertions();

    const { subscribe, update } = cell({ name: "a", address: "x" });

    let expectedState = "a";

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => state.name
    );

    update((state) => {
      return { ...state, address: "y" };
    });

    update((state) => {
      expectedState = "b";

      return { ...state, name: "b" };
    });

    unsubscribe();
  });

  test("Should return selected state (II)", () => {
    expect.hasAssertions();

    const { subscribe, update } = cell({ name: "a", address: "x", phone: 123 });

    let expectedState = "a, x, 123";

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => [state.name, state.address, state.phone].join(", ")
    );

    update((state) => {
      expectedState = "a, y, 123";

      return { ...state, address: "y" };
    });

    update((state) => {
      expectedState = "b, y, 123";

      return { ...state, name: "b" };
    });

    unsubscribe();
  });

  test("Should return selected state (III)", () => {
    expect.hasAssertions();

    const { subscribe, update } = cell({ name: "a", address: "x", phone: 123 });

    let expectedState = { name: "a", phone: 123 };

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => ({ name: state.name, phone: state.phone })
    );

    update((state) => {
      expectedState = { name: "a", phone: 123 };

      return { ...state, address: "y" };
    });

    update((state) => {
      expectedState = { name: "b", phone: 321 };

      return { ...state, name: "b", phone: 321 };
    });

    unsubscribe();
  });

  test("Should use equality comparator", () => {
    expect.hasAssertions();

    const { subscribe, update } = cell({ name: "a", address: "x", phone: 123 });

    let expectedState = { name: "a" };

    const unsubscribe = subscribe(
      (state) => {
        expect(state).toEqual(expectedState);
      },
      (state) => ({ name: state.name }),
      (curr, prev) => {
        return curr.name === prev.name;
      }
    );

    update((state) => {
      return { ...state, address: "y" };
    });

    update((state) => {
      expectedState = { name: "b" };

      return { ...state, name: "b", phone: 321 };
    });

    unsubscribe();
  });
});
