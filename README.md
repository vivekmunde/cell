# cell

Distributed state management for JavaScript applications.

# Cell

A `cell` is a state store, having state accessing APIs. It can be a group of state variables, grouped logically or with respect to the context (screens and/or components). The collection of these distributed state cells forms the complete state of the application. An application can have multiple cells to have a distributed state instead of holding all state in a single centralised state object.

The state is decentralised and can always stay close and confined to the module/screen/component. The state of these cells can be initialised on the go as the screens mount and can be cleared as the screens unmount.

For example, a `cell` can hold the logged in user details which can be accessed across the application. Another `cell` can be created for the Dashboard screen which holds all the state required for the Dashboard screen. Likewise, multiple cells can be created across application.

# createCell

Creates a `cell` with the default state and state accessing & updating methods.

### Type definition

```
declare const cell: <TState>(initialState: TState, config?: TCellConfiguration) => {
  publish: (reducer: TReducer<TState>) => void;
  subscribe: <TSelectedState>(subscriber: TSubscriber<TSelectedState>, selector?: TSelector<TState, TSelectedState> | undefined, areEqual?: TAreEqual<TSelectedState> | undefined) => TUnsubscribe;
};
```

### Arguments

- `state`: A default value of the state.
- `config`: Configuration options.

### Return value

A cell object having the state accessing & updating methods.

- `publish`: A function to update the state in cell and publish the change to all the subscribers.
- `subscribe`: A subscriber function to subscribe to the state changes. It returns a function to unsubscribe the subscriber from state changes.

## Configuration

Configuration options to be provided to the cell being created.

### Type definition

```
export type TCellConfiguration = {
  name?: string;
  enableLogging?: boolean;
};

```

### Properties

- `name`: Name of the cell. Used in logging. Default: "Unknown".
- `enableLogging`: Enable/disable console logging. Useful in development and/or test environments. If enabled then each action "create" | "publish" | "subscribe" | "unsubscribe" | "notify" gets logged on console with relevent data.

### Example

```
import cell from 'cell';
import TState from './types';

const usersAndRolesCell = cell<TState>(
  {
    loadingUsers: false,
    users: [],
    usersLoadingError?: undefined,
    loadingRoles: false,
    roles: [],
    rolesLoadingError?: undefined,
  },
  { name: 'usersAndRolesCell' },
);

export default usersAndRolesCell;
```

# Publish

It's a function to update the state in the cell and publish the state to all the subscribers. The publish function needs to be passed a function as an argument i.e. the `reducer` function. The `reducer` function receives the current state of the `cell` and it needs to return the updated state.

### Type definition

```
type TReducer<TState> = (state: TState) => TState;

type TPublish = (reducer: TReducer<TState>) => void;
```

### Arguments

- `reducer`: The `reducer` function to update and return the state. It receives the current state of the `cell` and it needs to return the updated state.

### Example

```
import usersAndRolesCell from '../cells/users-and-roles-cell';
import axios from 'axios';

const { publish } = usersAndRolesCell;

const loadUsers = async () => {
  try {
    // Reducer receives the complete state. So update only the needed state and return the complete state.

    // Before calling the API update only the loading & errors state
    publish(/* reducer */ (currentState) => ({
      ...currentState,
      loadingUsers: true,
      usersLoadingError: undefined,
    }));

    const respone = await axios.get('/users');

    // Update only the loading & users state
    publish(/* reducer */ (currentState) => ({
      ...currentState,
      loadingUsers: false,
      users: response.data,
    }));
  } catch (error) {
    // Update only the loading & error state
    publish(/* reducer */ (currentState) => ({
      ...currentState,
      loadingUsers: false,
      usersLoadingError: error.message,
    }));
  }
};

const loadRoles = async () => {
  try {
    // Reducer receives the complete state. So update only the needed state and return the complete state.

    // Before calling the API update only the loading & errors state
    publish(/* reducer */ (currentState) => ({
      ...currentState,
      loadingRoles: true,
      rolesLoadingError: undefined,
    }));

    const respone = await axios.get('/roles');

    // Update only the loading & roles state
    publish(/* reducer */ (currentState) => ({
      ...currentState,
      loadingRoles: false,
      roles: response.data,
    }));
  } catch (error) {
    // Update only the loading & error state
    publish(/* reducer */ (currentState) => ({
      ...currentState,
      loadingRoles: false,
      rolesLoadingError: error.message,
    }));
  }
};

loadUsers();
loadRoles();
```

# Subscribe

It's a function to revieve the state and the updates in state. Each time the state is updated in the cell, the subscrbier function is called with the latest updated state.

### Type definition

```
type TAreEqual<T> = (prevState: T | undefined, nextState: T) => boolean;

type TUnsubscribe = () => void;

type TSubscribe = <TSelectedState>(subscriber: TSubscriber<TSelectedState>, selector?: TSelector<TState, TSelectedState> | undefined, areEqual?: TAreEqual<TSelectedState> | undefined) => TUnsubscribe;

```

### Arguments

- `subscriber`: A subscriber function to be called each time the state change is changed and published. The subscriber function will recieve the data selected and returned by the `selector` function. If `selector` is not supplied then the subscruber function will receive the complete state.
- `selector`: A selector function to select the required state value(s) from the state and return the selected state.
- `areEqual`: An equality comparator function which receives previous and current selected state. This equality comparater function can be used to determine if the current selected state has changed from the previous selected state. If there is no change in the selected state then the subscribers will not be called. True: Meaning the selected state has not changed. False: Meaning the selected state has changed. If not passed then it uses the default comparator function (current, previous) => (current === previous).

### Return value

An unsubscriber function, which when called unsubscribes the subscriber function from from the state updates.

### Example

```
import usersAndRolesCell from '../cells/users-and-roles-cell';

const { subscribe } = usersAndRolesCell;

subscribe(
  (loading) => {
    // show loading icon
  },
  (state) => {
    return state.loadingUsers;
  }
);

subscribe(
  (users) => {
    // display users
  },
  (state) => {
    return state.users;
  }
);
```

# Using custom equality comparator function

```
import cell from 'cell';

const reportCell = cell({
  loading: false,
  report: undefined,
  error: undefined,
}, { name: 'reportCell' });

export default reportCell;
```

```
import axios from 'axios';
import reportCell from './cells/report-cell';

const { publish } = reportCell;

const loadReport = async () => {
    try {
    publish((currentState) => ({
      ...currentState,
      loading: true,
      error: undefined,
    }));

    const respone = await axios.get('/report');

    publish((currentState) => ({
      ...currentState,
      loading: false,
      report: response.data,
    }));
  } catch (error) {
    publish((currentState) => ({
      ...currentState,
      loading: false,
      error: error.message,
    }));
  }
};

loadReport();
```

```
import axios from 'axios';
import reportCell from './cells/report-cell';

const { subscribe } = reportCell;

subscribe(
  (report) => {
    // display report
  },
  (state) => {
    return state.report;
  },
  (currentReport, previousReport) => {
    // Check if the report has changed by comparing the lastUpdatedAt time
    return currentReport.lastUpdatedAt === previousReport.lastUpdatedAt;
  },
);
```

The custom equality comparator function checks if the report was updated by comparing the value of `lastUpdatedAt` in current and previous report. So even if user reloads the report and if the report has not changed, the subscriber function will not be called, as the report has not changed. This way the screen re-renders can be avoided.

### Selecting multiple state values

Multiple values can be retrieved from state in a single selector. But, that will always create a new object, meaning a new state. So the subscriber function will always be called even if the selected state has not changed. So its recommended to select the state as is.

Below selector will always create a new object and return it. So for any state updates in cell, the subscriber will be called. If users are loading the the roles will be rerenderred and vice-versa.

```
subscribe(
  (state) => {
    if (state.loadingUsers) {
      // show users loading icon
    } else {
      // render users
    }

    if (state.loadingRoles) {
      // show roles loading icon
    } else {
      // render roles
    }
  },
  (state) => {
    return {
      loadingUsers: state.loadingUsers,
      users: state.users,
      loadingRole: state.loadingRoles,
      roles: state.roles,
    };
  }
);
```

So always prefer using a separate selector for each state value.

```
subscribe(
  (loading) => {
    // show users loading icon
  },
  (state) => {
    return state.loadingUsers;
  }
);

subscribe(
  (users) => {
    // display users
  },
  (state) => {
    return state.users;
  }
);

subscribe(
  (loading) => {
    // show roles loading icon
  },
  (state) => {
    return state.loadingRoles;
  }
);

subscribe(
  (users) => {
    // display roles
  },
  (state) => {
    return state.roles;
  }
);
```

If multiple values are to be selected in a single selector then group the values logically and use a custom equality comparer function to check state changes.

```
subscribe(
  (state) => {
    if (state.loadingUsers) {
      // show users loading icon
    } else {
      // render users
    }
  },
  (state) => {
    return {
      loadingUsers: state.loadingUsers,
      users: state.users,
    };
  },
  (current, previous) => {
    return current.loadingUsers === previous.loadingUsers
      && current.users === previous.users;
  },
);
```

# Unsubscribe

The `subscribe` function returns a function to unsubscribe. Just call the unsubscribe function to unscribe from the state changes in the cell.

#### Example

```
import storage from 'local-storage';
import reportsCell from './cells/reports-cell';

const { subscribe } = reportsCell;

const unsubscribe = subscribe(...);

// E.g. Unsubscribe before the components are removed from DOM
unsubscribe();
```

# Caching

By default, the cells cache their current state in memory.

Before the components are removed from the DOM, this state can be cleared, simply by assigning an empty object or `undefined` to the state.

## Caching in session/local storage

To cache, subscribe to the state changes of the cell and cache the state value. Assign the cached value from storage while initializing the state.

### Example

```
import storage from 'local-storage';
import cell from 'cell';

// Get the state from storage and initialize the state in cell
const dashboardFiltersCell = cell(JSON.parse(storage.get('key') ?? {}));

// Subscribe to the changes in the state of the cell
// Store the state in storage
dashboardFiltersCell.subscribe((state) => {
  storage.set('key', JSON.stringify(state));
});
```

# Logging

Logging can be enabled while creating the cell. If logging is enabled then each action ('create','publish','subscribe','unsubscribe','notify') will get logged with relative data. Logging can be enabled in development environment.

### Type definition

```
type TLogAction =
  | "create"
  | "publish"
  | "subscribe"
  | "unsubscribe"
  | "notify";

type TSelectedStateLog<TSelectedState> = {
  previous: TSelectedState;
  current: TSelectedState;
};

type TStateLog<TState, TSelectedState> = {
  current: TState;
  previous: TState;
  selected?: TSelectedStateLog<TSelectedState>;
};

type TLog<TStateLog, TMetaData> = {
  cell: string;
  action: TLogAction;
  state: TStateLog;
  meta?: TMetaData;
};
```

### Properties

- cell: Name of the cell. Default = "Unknown".
- action: "create" | "publish" | "subscribe" | "unsubscribe" | "notify".
- state: Current and previous state of the cell. It also includes the current and previous selected state in case of action 'notify'.
- meta: Any metadata. E.g. when a subscriber is notified then the sibscriber function's name is added in the metadata.

#### Actions

- create: When cell is created.
- publish: When state is updated and published to subscribers.
- subscribe: When a subscriber function is subscribed.
- unsubscribe: When a subscriber function is unsubscribed.
- notify: When a subscriber function is called with the state.

### Example

```
import cell from 'cell';

const dashboardCell = cell(
  {
    loading: false,
    users: [],
    roles: [],
  },
  {
    name: 'dashboardCell',
    enableLogging: process.env.NODE_ENV === 'development',
  },
);
```

### Log Examples

```
'cell', { cell: 'dashboardCell', action: 'create', state : { current: { loading: true, users: [], roles: [] }, previous: { loading: true, users: [], roles: [] } } }
```

```
'cell', { cell: 'dashboardCell', action: 'publish', state : { current: { loading: true, users: [], roles: [] }, previous: { loading: false, users: [], roles: [] } } }
```

```
'cell', { cell: 'dashboardCell', action: 'notify', state : { current: { loading: true, users: [], roles: [] }, previous: { loading: false, users: [], roles: [] } }, meta: { subscriber: 'sibscribeToDashboardCell' } }
```

```
'cell', { cell: 'dashboardCell', action: 'publish', state : { current: { loading: false, users: [{ name: 'a' }], roles: [{ name: 'admin' }] }, previous: { loading: true, users: [], roles: [] } } }
```

```
'cell', { cell: 'dashboardCell', action: 'subscribe', state : { current: { loading: false, users: [{ name: 'a' }], roles: [{ name: 'admin' }] }, previous: { loading: true, users: [], roles: [] } } }
```

```
'cell', { cell: 'dashboardCell', action: 'notify', state : { current: { loading: false, users: [{ name: 'a' }], roles: [{ name: 'admin' }] }, previous: { loading: true, users: [], roles: [] } }, meta: { subscriber: 'sibscribeToDashboardCell' } }
```

# License

MIT
