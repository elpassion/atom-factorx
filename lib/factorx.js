'use babel';

// @flow

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import { CompositeDisposable } from 'atom';
import VariableInput from './VariableInput';
import SelectList from './SelectList';
import { renameVariable, getExpressions } from './cli';
import { getPositionFromIndexesPosition, getIndexesPositionFromBufferPosition } from './helpers';

class FactorX {
  subscriptions: atom$CompositeDisposable;
  variableInput: VariableInput;
  selectList: SelectList;

  activate() {
    this.subscribeToEvents();
    this.buildElements();
  }

  subscribeToEvents() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'factorx:extractVariable': this.extractVariableFlow,
        'factorx:renameVariable': this.renameVariableFlow,
      }),
    );
  }

  buildElements() {
    if (!this.variableInput) {
      this.variableInput = new VariableInput();
    }
    if (!this.selectList) {
      this.selectList = new SelectList();
    }
  }

  extractVariableFlow = async () => {
    try {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const currentIndexPosition = this.getCurrentIndexesPosition(editor)
        const args = this.getArgs(editor, [currentIndexPosition])
        const getExpressionsResult = await getExpressions(...args);
        // const selectedExpression = await this.selectList.open(getExpressionsResult.expressions);
        // const getExpressionOccurrencesResult = await getExpressionOccurrences(...args);
        // const extractVariableResult = await extractVariable(...args);
        // this.replaceCodeWithResult(extractVariableResult);
        // this.renameVariableFlow();
      } else {
        console.log('Something went wrong!');
      }
    } catch (e) {
      console.log(e);
    }
  }

  renameVariableFlow = async () => {
    try {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        const newVarName = await this.variableInput.open('dupa');
        const currentIndexPosition = this.getCurrentIndexesPosition(editor)
        const args = this.getArgs(editor, [currentIndexPosition], newVarName)
        const renameResult = await renameVariable(...args);
        this.replaceCodeWithResult(renameResult, editor);
      } else {
        console.log('Something went wrong!');
      }
    } catch (e) {
      console.log(e);
    }
  }

  getArgs(editor: atom$TextEditor, positions: Array<any>, ...otherArgs: Array<any>) {
    const buffer = editor.getBuffer();
    return [
      buffer.getText(),
      ...positions.reduce((acc, position) => [...acc, position.start, position.end], []),
      ...otherArgs,
    ]
  }

  getCurrentIndexesPosition(editor: atom$TextEditor) {
    const currentPosition = editor.getSelectedBufferRange();
    const buffer = editor.getBuffer();
    return getIndexesPositionFromBufferPosition(
      buffer,
      currentPosition,
    );
  }

  replaceCodeWithResult(result: Object, editor: atom$TextEditor) {
    const cursorPositionPriorToFormat = editor.getCursorScreenPosition();
    const buffer = editor.getBuffer();
    buffer.setText(result.code);
    editor.setCursorBufferPosition(cursorPositionPriorToFormat);
    const range = getPositionFromIndexesPosition(buffer, result.cursorPosition);
    editor.setSelectedBufferRange(range);
  }

  deactivate() {
    this.subscriptions.dispose();
  }
}

export default new FactorX();
