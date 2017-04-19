'use babel';

// @flow

import { createStore } from 'redux';

const counter = (state = 0) => state;
// type State = number;
// type Action = { type: 'TEST' };

const store: Store = createStore(counter);
store.getState();

export default store;
