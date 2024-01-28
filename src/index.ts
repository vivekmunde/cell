import * as pusu from "pusu";

/**
 * A subscriber function to be called each time the state change is published.
 * @param {TSelectedState} state - The selected state. If selector is not provided then the entire state is returned.
 */
type TSubscriber<TSelectedState> = (
  /** The selected state. If selector is not provided then the entire state is returned. */
  state: TSelectedState
) => void;

/**
 * An unsubscriber function, which when called unsubscribes the subscriber function from from the state updates.
 */
type TUnsubscribe = () => void;

/**
 * A selector function to select the required state value(s) from the state.
 * @param {TState} state - Latest state of the cell.
 * @returns {TSelectedState} Selected state.
 */
type TSelector<TState, TSelectedState> = (
  /** Latest state of the cell. */
  state: TState
) => TSelectedState;

/**
 * An equality comparater function to determine if the previous selected state and the current selected state are equal. If there is no change in the selected state then the subscribers will not be called.
 * @param {TSelectedState} currentState - Current selected state of the cell.
 * @param {TSelectedState} previousState - Previous selected state of the cell.
 * @returns {boolean} A boolean result indicating if the selected state is changed or not. True = Equal meaning selected state is not changed. False = Not equal meaning selected state is changed.
 */
type TAreEqual<TSelectedState> = (
  /** Current selected state of the cell. */
  currentState: TSelectedState,
  /** Previous selected state of the cell. */
  previousState: TSelectedState
) => boolean;

/**
 * A reducer function which recieves the current state fo the cell and should return the updated state.
 * @param {function} state - Current state of the cell.
 * @returns {TState} Updated state.
 */
type TReducer<TState> = (
  /** Current state of the cell. */
  state: TState
) => TState;

/**
 * Creates and returns a new cell object with publish & subscribe methods.
 *
 * @param {TState} initialState - Initial state to be set in the cell.
 * @returns {Object} Cell.
 */
const cell = <TState>(
  initialState: TState
): {
  /**
   * Subscribes to the updates in the state of the cell.
   * @param {TSubscriber} subscriber - A subscriber function to be called each time the state change is published.
   * @param {TSelector} selector - A selector function to select the required state value(s) from the state.
   * @param {TAreEqual} areEqual - An equality comparater function to determine if the previous selected state and the current selected state has changed. If there is no change in the selected state then the subscribers will not be called.
   * @returns {TUnsubscribe} An unsubscriber function, which when called unsubscribes the subscriber function from from the state updates.
   */
  subscribe: <TSelectedState>(
    subscriber: TSubscriber<TSelectedState>,
    selector?: TSelector<TState, TSelectedState>,
    areEqual?: TAreEqual<TSelectedState>
  ) => TUnsubscribe;

  /**
   * Updates the state in cell and calls all subscribers with the updated state.
   * @param {TReducer} reducer - A reducer function which recieves the current state fo the cell and should return the updated state.
   */
  publish: (reducer: TReducer<TState>) => void;
} => {
  const publication = pusu.createPublication<TState>("cell");

  let previousState = initialState;
  let currentState = initialState;

  const subscribe = <TSelectedState>(
    subscriber: (state: TSelectedState) => void,
    selector?: (state: TState) => TSelectedState,
    areEqual?: (
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

    if (areEqual && typeof areEqual !== "function") {
      throw new Error("areEqual must be a function.");
    }

    const unsubscribe = pusu.subscribe(publication, (state) => {
      const prevSelectedState = (
        selector ? selector(previousState) : previousState
      ) as TSelectedState;
      const currSelectedState = (
        selector ? selector(state) : state
      ) as TSelectedState;

      const fnIsEqual = areEqual
        ? areEqual
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

  const publish = (reducer: (state: TState) => TState): void => {
    previousState = currentState;

    currentState = reducer(currentState);

    pusu.publish(publication, currentState);
  };

  return { subscribe, publish };
};

export default cell;
