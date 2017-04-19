'use babel';

// @flow
import { combineReducers } from 'redux';
import type { Store as ReduxStore } from 'redux';
import { reducer as VIReducer } from '../VariableInput';
import type { State as VIState, Action as VIAction } from '../VariableInput/types';

type State = {
  VariableInput: VIState
};

const state = {
  VariableInput: VIReducer,
};

type Action = VIAction;

export type Store = ReduxStore<State, Action>
export default combineReducers(state);
