'use babel';

// @flow

export const EDITOR_FONT_SIZE = parseInt(atom.config.get('editor.fontSize'), 10);
export const EDITOR_LINE_HEIGHT = parseInt(atom.config.get('editor.lineHeight'), 10);
export const OFFSET_TOP = EDITOR_FONT_SIZE * EDITOR_LINE_HEIGHT;
