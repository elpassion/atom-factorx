'use babel';

// @flow

type Position = {
  x: ?number,
  y: ?number,
};

export type State = {
  position: Position,
  isOpened: boolean,
  varName: string,
};

type OpenAction = { type: 'VI_OPEN', position: Position, varName: string };
type CloseAction = { type: 'VI_CLOSE' };
type ChangeVarNameAction = { type: 'VI_CHANGE_VAR_NAME', newVarName: string };
export type Action = OpenAction | CloseAction | ChangeVarNameAction;
