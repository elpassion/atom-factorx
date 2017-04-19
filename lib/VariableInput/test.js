'use babel';

// @flow
import { reducer, initialState } from './index';

describe('VariableInputReducer', () => {
  test('initialState is Ok', () => {
    expect(reducer(undefined, { type: 'TEST' })).toEqual(initialState);
  });

  const closeState = {
    ...initialState,
  };

  const openState = {
    ...initialState,
    position: {
      x: 0,
      y: 0,
    },
    isOpened: true,
    varName: 'abc',
  };

  test('handles OPEN', () => {
    const position = {
      x: 1,
      y: 1,
    };
    const varName = 'abcde';
    expect(reducer(closeState, { type: 'VI_OPEN', position, varName })).toEqual({
      ...closeState,
      isOpened: true,
      varName,
      position,
    });
  });

  test('handles CLOSE', () => {
    expect(reducer(openState, { type: 'VI_CLOSE' })).toEqual(closeState);
  });

  test('handles CHANGE_VAR_NAME', () => {
    expect(reducer(openState, { type: 'VI_CHANGE_VAR_NAME', newVarName: 'abcd' })).toEqual({
      ...openState,
      varName: 'abcd',
    });
  });
});
