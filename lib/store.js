'use babel';

// @flow

import { createStore } from 'redux';

const counter = (state = 0) => state;
const store = createStore(counter);

export default store;
