'use babel';

// @flow

const a = 5;
5 + 5;

export const EDITOR_FONT_SIZE = parseInt(atom.config.get('editor.fontSize'), 10);
export const EDITOR_LINE_HEIGHT = parseInt(atom.config.get('editor.lineHeight'), 10);
export const OFFSET_TOP = EDITOR_FONT_SIZE * EDITOR_LINE_HEIGHT;
