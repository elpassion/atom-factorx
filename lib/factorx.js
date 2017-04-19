'use babel';

// @flow

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import { CompositeDisposable } from 'atom';
import VariableInput from './VariableInput';
import SelectList from './SelectList';
import {
  renameVariable,
  getExpressions,
  getExpressionOccurrences,
  extractVariable,
} from './cli';
import { getPositionFromIndexesPosition, getIndexesPositionFromBufferPosition } from './helpers';

class FactorX {
  subscriptions: atom$CompositeDisposable;
  variableInput: VariableInput;
  selectList: SelectList;
  editor: atom$TextEditor;

  activate() {
    this.subscribeToEvents();
    this.buildElements();
  }

  subscribeToEvents() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'factorx:extractVariable': () => this.extractVariableFlow('variable'),
        'factorx:extractConstant': () => this.extractVariableFlow('constant'),
        'factorx:renameVariable': () => this.renameVariableFlow(),
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

  extractVariableFlow = (type: 'constant' | 'variable') => {
    this.createFlow(async () => {
      try {
        const buffer = this.editor.getBuffer();
        const currentIndexPosition = this.getCurrentIndexesPosition();
        const getExpressionsResult = await getExpressions(
          buffer.getText(),
          currentIndexPosition.start,
          currentIndexPosition.end,
        );

        const { expressions } = getExpressionsResult;

        const formattedChoices = expressions.map(choice => ({
          value: choice.value,
          indexPosition: choice.position,
          position: getPositionFromIndexesPosition(buffer, choice.position),
        }));

        let selectedExpression;

        if (expressions.length > 1) {
          selectedExpression = await this.selectList.open(formattedChoices);
        } else {
          selectedExpression = formattedChoices[0];
        }

        console.log(selectedExpression);

        const getExpressionOccurrencesResult = await getExpressionOccurrences(
          buffer.getText(),
          selectedExpression.indexPosition.start,
          selectedExpression.indexPosition.end,
        );

        const { expressions: occurrences } = getExpressionOccurrencesResult;
        const formattedOccurrences = [
          {
            value: 'This occurrence only',
            indexPosition: [occurrences[0].position],
            position: [getPositionFromIndexesPosition(buffer, occurrences[0].position)],
          },
          {
            value: `All ${occurrences.length} occurrences`,
            indexPosition: occurrences.map(occurrence => occurrence.position),
            position: occurrences.map(
              occurrence => getPositionFromIndexesPosition(buffer, occurrence.position),
            ),
          },
        ];

        let selectedOccurrences;

        if (occurrences.length > 1) {
          selectedOccurrences = await this.selectList.open(formattedOccurrences);
        } else {
          selectedOccurrences = formattedOccurrences[0];
        }


        const formattedSelectedOccurrences = selectedOccurrences.indexPosition.reduce(
          (acc, position) => [...acc, position.start, position.end],
          [],
        );

        console.log(formattedSelectedOccurrences);

        const extractVariableResult = await extractVariable(
          type,
          buffer.getText(),
          ...formattedSelectedOccurrences,
        );

        this.replaceCodeWithResult(extractVariableResult);

        this.renameVariableFlow();
      } catch (e) {
        console.error(e);
      }
    })();
  }

  renameVariableFlow = () => {
    this.createFlow(async () => {
      try {
        const newVarName = await this.variableInput.open('');
        const currentIndexPosition = this.getCurrentIndexesPosition(this.editor);
        const renameResult = await renameVariable(
          this.editor.getBuffer().getText(),
          currentIndexPosition.start,
          currentIndexPosition.end,
          newVarName,
        );
        this.replaceCodeWithResult(renameResult, this.editor);
      } catch (e) {
        console.error(e);
      }
    })();
  }

  createFlow = (flow: Function) => (
    () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        this.editor = editor;
        flow();
      } else {
        console.error('Something went wrong!');
      }
    }
  )

  getCurrentIndexesPosition() {
    const currentPosition = this.editor.getSelectedBufferRange();
    const buffer = this.editor.getBuffer();
    return getIndexesPositionFromBufferPosition(
      buffer,
      currentPosition,
    );
  }

  replaceCodeWithResult(result: Object) {
    const cursorPositionPriorToFormat = this.editor.getCursorScreenPosition();
    const buffer = this.editor.getBuffer();
    buffer.setText(result.code);
    this.editor.setCursorBufferPosition(cursorPositionPriorToFormat);
    const range = getPositionFromIndexesPosition(buffer, result.cursorPosition);
    this.editor.setSelectedBufferRange(range);
  }

  deactivate() {
    this.subscriptions.dispose();
  }
}

export default new FactorX();
