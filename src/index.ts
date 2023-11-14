import * as pusu from "pusu";

const cell = <TState>(
  initialState: TState
): {
  subscribe: <TSelectedState>(
    subscriber: (state: TSelectedState) => void,
    selector?: (state: TState) => TSelectedState,
    isEqual?: (
      currentState: TSelectedState,
      previousState: TSelectedState
    ) => boolean
  ) => () => void;
  update: (reducer: (state: TState) => TState) => void;
} => {
  const publication = pusu.createPublication<TState>("cell");

  let previousState = initialState;
  let currentState = initialState;

  const subscribe = <TSelectedState>(
    subscriber: (state: TSelectedState) => void,
    selector?: (state: TState) => TSelectedState,
    isEqual?: (
      currentState: TSelectedState,
      previousState: TSelectedState
    ) => boolean
  ) => {
    if (typeof subscriber !== "function") {
      throw new Error("subscriber must be a function.");
    }

    if (selector && typeof selector !== "function") {
      throw new Error("selector must be a function.");
    }

    if (isEqual && typeof isEqual !== "function") {
      throw new Error("isEqual must be a function.");
    }

    const unsubscribe = pusu.subscribe(publication, (state) => {
      const prevSelectedState = (
        selector ? selector(previousState) : previousState
      ) as TSelectedState;
      const currSelectedState = (
        selector ? selector(state) : state
      ) as TSelectedState;

      const fnIsEqual = isEqual
        ? isEqual
        : (a: TSelectedState, b: TSelectedState) => a === b;

      if (!fnIsEqual(currSelectedState, prevSelectedState)) {
        subscriber(currSelectedState);
      }
    });

    subscriber(
      (selector ? selector(currentState) : currentState) as TSelectedState
    );

    return unsubscribe;
  };

  const update = (reducer: (state: TState) => TState): void => {
    previousState = currentState;

    currentState = reducer(currentState);

    pusu.publish(publication, currentState);
  };

  return { subscribe, update };
};

export default cell;
