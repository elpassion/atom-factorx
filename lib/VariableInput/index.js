'use babel';

// @flow
type Position = {
  x: ?number,
  y: ?number,
};

type State = {
  position: Position,
  isOpened: boolean,
  varName: string,
};

type OpenAction = { type: 'VI_OPEN', position: Position, varName: string };
type CloseAction = { type: 'VI_CLOSE' };
type ChangeVarNameAction = { type: 'VI_CHANGE_VAR_NAME', newVarName: string };

export const initialState: State = { position: { x: null, y: null }, isOpened: false, varName: '' };

export const reducer = (
  state: State = initialState,
  action: typeof undefined | OpenAction | CloseAction | ChangeVarNameAction,
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
