'use babel';

// @flow

import type { State, Action } from './types';

// InitialState
export const initialState: State = { position: { x: null, y: null }, isOpened: false, varName: '' };

export const reducer = (
  state: State = initialState,
  action: Action,
) => {
  switch (action.type) {
    case 'VI_OPEN':
      return {
        ...initialState,
        isOpened: true,
        position: action.position,
        varName: action.varName,
      };
    case 'VI_CLOSE':
      return { ...initialState };
    case 'VI_CHANGE_VAR_NAME':
      return { ...state, varName: action.newVarName };
    default:
      return { ...initialState };
  }
};
