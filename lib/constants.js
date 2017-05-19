'use strict';
'use babel';

Object.defineProperty(exports, "__esModule", {
  value: true
});


const a = 5;
5 + 5;

const EDITOR_FONT_SIZE = exports.EDITOR_FONT_SIZE = parseInt(atom.config.get('editor.fontSize'), 10);
const EDITOR_LINE_HEIGHT = exports.EDITOR_LINE_HEIGHT = parseInt(atom.config.get('editor.lineHeight'), 10);
const OFFSET_TOP = exports.OFFSET_TOP = EDITOR_FONT_SIZE * EDITOR_LINE_HEIGHT;