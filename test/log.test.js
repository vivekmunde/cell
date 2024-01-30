import cell from "../lib/es";

describe("logging", () => {
  test("Should not log when the flag is not passed", () => {
    expect.hasAssertions();

    const logSpy = jest.spyOn(console, "log");

    const { subscribe, publish } = cell({ name: "x" });

    expect(logSpy).not.toHaveBeenCalled();

    let expectedState = { name: "x" };

    const unsubscribe = subscribe((state) => {
      expect(state).toEqual(expectedState);
    });

    publish(() => {
      expectedState = { name: "y" };

      return { name: "y" };
    });

    expect(logSpy).not.toHaveBeenCalled();

    unsubscribe();

    expect(logSpy).not.toHaveBeenCalled();
  });

  test("Should not log when the flag with value false is passed", () => {
    expect.hasAssertions();

    const logSpy = jest.spyOn(console, "log");

    const { subscribe, publish } = cell(
      { name: "x" },
      { enableLogging: false }
    );

    expect(logSpy).not.toHaveBeenCalled();

    let expectedState = { name: "x" };

    const unsubscribe = subscribe((state) => {
      expect(state).toEqual(expectedState);
    });

    publish(() => {
      expectedState = { name: "y" };

      return { name: "y" };
    });

    expect(logSpy).not.toHaveBeenCalled();

    unsubscribe();

    expect(logSpy).not.toHaveBeenCalled();
  });

  test("Should log", () => {
    expect.hasAssertions();

    const logSpy = jest.spyOn(console, "log");

    const { subscribe, publish } = cell(
      { name: "x" },
      { name: "test", enableLogging: true }
    );

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "create",
      state: {
        current: { name: "x" },
        previous: { name: "x" },
      },
    });

    let published = false;

    const unsubscribe = subscribe(function subscriber() {
      if (published) {
        expect(logSpy).toHaveBeenCalledWith("cell", {
          cell: "test",
          action: "notify",
          state: {
            current: { name: "y" },
            previous: { name: "x" },
            selected: { current: { name: "y" }, previous: { name: "x" } },
          },
          meta: { subscriber: "subscriber" },
        });
      } else {
        expect(logSpy).toHaveBeenCalledWith("cell", {
          cell: "test",
          action: "notify",
          state: {
            current: { name: "x" },
            previous: { name: "x" },
            selected: { current: { name: "x" }, previous: { name: "x" } },
          },
          meta: { subscriber: "subscriber" },
        });
      }
    });

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "subscribe",
      state: { current: { name: "x" }, previous: { name: "x" } },
      meta: { subscriber: "subscriber" },
    });

    published = true;

    publish(() => {
      return { name: "y" };
    });

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "publish",
      state: { current: { name: "y" }, previous: { name: "x" } },
    });

    unsubscribe();

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "unsubscribe",
      state: { current: { name: "y" }, previous: { name: "x" } },
      meta: { subscriber: "subscriber" },
    });
  });

  test("Should log with default name", () => {
    expect.hasAssertions();

    const logSpy = jest.spyOn(console, "log");

    const { subscribe, publish } = cell({ name: "x" }, { enableLogging: true });

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "Unknown",
      action: "create",
      state: {
        current: { name: "x" },
        previous: { name: "x" },
      },
    });

    let published = false;

    const unsubscribe = subscribe(function subscriber() {
      if (published) {
        expect(logSpy).toHaveBeenCalledWith("cell", {
          cell: "Unknown",
          action: "notify",
          state: {
            current: { name: "y" },
            previous: { name: "x" },
            selected: { current: { name: "y" }, previous: { name: "x" } },
          },
          meta: { subscriber: "subscriber" },
        });
      } else {
        expect(logSpy).toHaveBeenCalledWith("cell", {
          cell: "Unknown",
          action: "notify",
          state: {
            current: { name: "x" },
            previous: { name: "x" },
            selected: { current: { name: "x" }, previous: { name: "x" } },
          },
          meta: { subscriber: "subscriber" },
        });
      }
    });

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "Unknown",
      action: "subscribe",
      state: { current: { name: "x" }, previous: { name: "x" } },
      meta: { subscriber: "subscriber" },
    });

    published = true;

    publish(() => {
      return { name: "y" };
    });

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "Unknown",
      action: "publish",
      state: { current: { name: "y" }, previous: { name: "x" } },
    });

    unsubscribe();

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "Unknown",
      action: "unsubscribe",
      state: { current: { name: "y" }, previous: { name: "x" } },
      meta: { subscriber: "subscriber" },
    });
  });

  test("Should log selected state", () => {
    expect.hasAssertions();

    const logSpy = jest.spyOn(console, "log");

    const { subscribe, publish } = cell(
      { name: "x" },
      { name: "test", enableLogging: true }
    );

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "create",
      state: {
        current: { name: "x" },
        previous: { name: "x" },
      },
    });

    let published = false;

    const unsubscribe = subscribe(
      function subscriber() {
        if (published) {
          expect(logSpy).toHaveBeenCalledWith("cell", {
            cell: "test",
            action: "notify",
            state: {
              current: { name: "y" },
              previous: { name: "x" },
              selected: { current: "y", previous: "x" },
            },
            meta: { subscriber: "subscriber" },
          });
        } else {
          expect(logSpy).toHaveBeenCalledWith("cell", {
            cell: "test",
            action: "notify",
            state: {
              current: { name: "x" },
              previous: { name: "x" },
              selected: { current: "x", previous: "x" },
            },
            meta: { subscriber: "subscriber" },
          });
        }
      },
      function selector(state) {
        return state.name;
      }
    );

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "subscribe",
      state: { current: { name: "x" }, previous: { name: "x" } },
      meta: { subscriber: "subscriber" },
    });

    published = true;

    publish(() => {
      return { name: "y" };
    });

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "publish",
      state: { current: { name: "y" }, previous: { name: "x" } },
    });

    unsubscribe();

    expect(logSpy).toHaveBeenCalledWith("cell", {
      cell: "test",
      action: "unsubscribe",
      state: { current: { name: "y" }, previous: { name: "x" } },
      meta: { subscriber: "subscriber" },
    });
  });
});
