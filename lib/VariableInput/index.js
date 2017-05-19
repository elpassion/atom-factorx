'use strict';
'use babel';

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _constants = require('../constants');

class VariableInput {

  constructor() {
    this.open = varName => {
      const inputPromise = new Promise((resolve, reject) => {
        this.resolveInputPromise = resolve;
        this.rejectInputPromise = reject;
      });

      const parentEditor = atom.workspace.getActiveTextEditor();
      if (parentEditor) {
        this.parentEditor = parentEditor;
        this.setupDomElement();
        this.appendDomElementToView();
        this.createInput(varName);
      }

      return inputPromise;
    };

    this.setupDomElement = () => {
      const cursor = this.parentEditor.getLastCursor();
      const editorView = atom.views.getView(this.parentEditor);
      const { top, left } = editorView.pixelPositionForBufferPosition(cursor.getBufferPosition());
      const x = left - editorView.getScrollLeft();
      const y = top - editorView.getScrollTop();
      this.domElement.style.top = `${y + _constants.OFFSET_TOP}px`;
      this.domElement.style.left = `${x}px`;
      this.domElement.style.width = '100px';
    };

    this.close = () => {
      this.deattachEvents();
      this.removeInput();
      this.focusParentEditor();
    };

    this.handleKeyDown = e => {
      const { key } = e;
      if (key.toLowerCase() === 'escape') {
        this.rejectInputPromise();
        this.close();
        e.stopPropagation();
      } else if (key.toLowerCase() === 'enter') {
        this.resolveInputPromise(this.inputEditor.getText());
        this.close();
        e.stopPropagation();
      }
    };

    this.attachEvents = () => {
      const inputView = atom.views.getView(this.inputEditor);

      inputView.addEventListener('blur', this.close);
      inputView.addEventListener('keydown', this.handleKeyDown, false);
    };

    this.deattachEvents = () => {
      const inputView = atom.views.getView(this.inputEditor);

      inputView.removeEventListener('blur', this.close);
      inputView.removeEventListener('keydown', this.handleKeyDown, false);
    };

    this.createDomElement();
  }

  createDomElement() {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('fx-vi-container');
  }

  createInput(varName) {
    this.inputEditor = new _atom.TextEditor({ mini: true });
    this.inputEditor.setText(varName);
    this.inputEditor.selectAll();
    const inputView = atom.views.getView(this.inputEditor);
    inputView.classList.add('fx-vi-input');
    this.domElement.appendChild(inputView);
    this.attachEvents();
    inputView.focus();
  }

  removeInput() {
    const inputView = atom.views.getView(this.inputEditor);
    inputView.remove();
  }

  appendDomElementToView() {
    const editorView = atom.views.getView(this.parentEditor);
    editorView.appendChild(this.domElement);
  }

  focusParentEditor() {
    const editorView = atom.views.getView(this.parentEditor);
    editorView.focus();
  }
}
exports.default = VariableInput;