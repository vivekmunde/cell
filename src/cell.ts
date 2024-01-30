import * as pusu from "pusu";
import log from "./log";
import {
  TAreEqual,
  TCellConfiguration,
  TLogAction,
  TStateLog,
  TReducer,
  TSelector,
  TSubscriber,
  TUnsubscribe,
} from "./types";

/**
 * Creates and returns a new cell object with publish & subscribe methods.
 *
 * @param {TState} initialState - Initial state to be set in the cell.
 * @returns {Object} Cell.
 */
const cell = <TState>(
  initialState: TState,
  config?: TCellConfiguration
): {
  /**
   * Updates the state in cell and calls all subscribers with the updated state.
   *
   * @param {TReducer} reducer - A reducer function which recieves the current state fo the cell and should return the updated state.
   */
  publish: (reducer: TReducer<TState>) => void;

  /**
   * Subscribes to the updates in the state of the cell.
   *
   * @param {TSubscriber} subscriber - A subscriber function to be called each time the state change is published. The subscriber function will recieve the data selected and returned by the selector function. If selector is not supplied then the subscruber function will receive the complete state.
   * @param {TSelector} selector - A selector function to select the required state value(s) from the state and return the selected state.
   * @param {TAreEqual} areEqual - An equality comparator function which receives previous and current selected state. This equality comparater function can be used to determine if the current selected state has changed from the previous selected state. If there is no change in the selected state then the subscribers will not be called. True: Meaning the selected state has not changed. False: Meaning the selected state has changed. If not passed then it uses the default comparator function (current, previous) => (current === previous).
   * @returns {TUnsubscribe} An unsubscriber function, which when called unsubscribes the subscriber function from from the state updates.
   */
  subscribe: <TSelectedState>(
    subscriber: TSubscriber<TSelectedState>,
    selector?: TSelector<TState, TSelectedState>,
    areEqual?: TAreEqual<TSelectedState>
  ) => TUnsubscribe;
} => {
  const _name = config?.name;
  const _loggingEnabled = config?.enableLogging;

  let previousState = initialState;
  let currentState = initialState;

  const _log = <TSelectedState, TMetaData>(
    action: TLogAction,
    selectedState?: {
      previous: TSelectedState;
      current: TSelectedState;
    },
    meta?: TMetaData
  ) => {
    if (_loggingEnabled) {
      const stateToLog: TStateLog<TState, TSelectedState> = {
        current: currentState,
        previous: previousState,
        selected: selectedState,
      };
      log(_name, action, stateToLog, meta);
    }
  };

  _log("create");

  const publication = pusu.createPublication<TState>({ name: _name });

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

    _log<undefined, { subscriber: string }>("subscribe", undefined, {
      subscriber: subscriber.name,
    });

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
        _log<TSelectedState, { subscriber: string }>(
          "notify",
          { current: currSelectedState, previous: prevSelectedState },
          {
            subscriber: subscriber.name,
          }
        );

        subscriber(currSelectedState);
      }
    });

    const notifyImmediately = () => {
      const selectedState = (
        selector ? selector(currentState) : currentState
      ) as TSelectedState;

      _log<TSelectedState, { subscriber: string }>(
        "notify",
        { current: selectedState, previous: selectedState },
        {
          subscriber: subscriber.name,
        }
      );

      subscriber(selectedState);
    };

    notifyImmediately();

    return () => {
      _log<undefined, { subscriber: string }>("unsubscribe", undefined, {
        subscriber: subscriber.name,
      });

      unsubscribe();
    };
  };

  const publish = (reducer: (state: TState) => TState): void => {
    previousState = currentState;

    currentState = reducer(currentState);

    _log<undefined, undefined>("publish", undefined);

    pusu.publish(publication, currentState);
  };

  return { publish, subscribe };
};

export default cell;
