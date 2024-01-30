import { TLog, TLogAction, TStateLog } from "./types";

/**
 * Logs the action and its relative information.
 *
 * @param {string} cell - Name of the cell.
 * @param {TLogAction} action - Action: "create" | "publish" | "subscribe" | "unsubscribe" | "notify" | "select" | "compare"
 * @property {TStateLog} state - State to log.
 * @param {TMetaData} meta - Any metadata. E.g. when the subscribers are called then the subscriber function name is added in the metadata.
 */
const log = <TState, TSelectedState, TMetaData>(
  cell: string | undefined,
  action: TLogAction,
  state: TStateLog<TState, TSelectedState>,
  meta?: TMetaData
) => {
  const stateToLog: TStateLog<TState, TSelectedState> = {
    current: state.current,
    previous: state.previous,
  };

  if (state.selected) {
    stateToLog.selected = state.selected;
  }

  const info: TLog<TStateLog<TState, TSelectedState>, TMetaData> = {
    cell: cell ?? "Unknown",
    action,
    state: stateToLog,
  };

  if (meta) {
    info.meta = meta;
  }

  console.log("cell", info);
};

export default log;
