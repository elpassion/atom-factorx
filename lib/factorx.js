'use babel';

// @flow

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import { CompositeDisposable } from 'atom';
import VariableInput from './VariableInput';
import { renameVariable } from './cli';
import { getPositionFromIndexesPosition, getIndexesPositionFromBufferPosition } from './helpers';

class FactorX {
  subscriptions: atom$CompositeDisposable;
  variableInput: VariableInput;

  activate() {
    this.subscribeToEvents();
    this.buildElements();
  }

  subscribeToEvents() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'factorx:extractVariable': this.renameFlow,
      }),
    );
  }

  buildElements() {
    if (!this.variableInput) {
      this.variableInput = new VariableInput();
    }
  }

  renameFlow = async () => {
    try {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const cursorPositionPriorToFormat = editor.getCursorScreenPosition();
        const newVarName = await this.variableInput.open('dupa');
        const currentPosition = editor.getSelectedBufferRange();
        const buffer = editor.getBuffer();
        const currentIndeIndexPosition = getIndexesPositionFromBufferPosition(
          buffer,
          currentPosition,
        );
        const args = [
          buffer.getText(),
          currentIndeIndexPosition.start,
          currentIndeIndexPosition.end,
          newVarName,
        ]
        const renameResult = await renameVariable(...args);
        buffer.setText(renameResult.code);
        editor.setCursorBufferPosition(cursorPositionPriorToFormat);
        const range = getPositionFromIndexesPosition(buffer, renameResult.cursorPosition);
        editor.setSelectedBufferRange(range);
      } else {
        console.log('Something went wrong!');
      }
    } catch (e) {
      console.log(e);
    }
  }

  deactivate() {
    this.subscriptions.dispose();
  }
}

export default new FactorX();
