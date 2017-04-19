'use babel';

// @flow
import { createStore } from 'redux';
import rootReducer from './state';
import type { Store } from './state';

const store: Store = createStore(rootReducer);

export default store;
