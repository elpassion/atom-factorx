// @flow

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import { CompositeDisposable } from 'atom';
import VariableInput from './VariableInput';
import SelectList from './SelectList';
import { renameVariable, getExpressions, getExpressionOccurrences, extractVariable } from './cli';
import type { codeResult } from './cli';
import FxSelection from './FxSelection';

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
        const getExpressionsResult = await getExpressions(
          buffer.getText(),
          ...FxSelection.current(this.editor).firstIndexRanges(),
        );
        const { expressions } = getExpressionsResult;
        const formattedChoices = expressions.map(expression =>
          FxSelection.fromFxExpressionForBuffer(expression, buffer),
        );

        let selectedExpression;

        if (expressions.length > 1) {
          selectedExpression = await this.selectList.open(formattedChoices);
        } else {
          selectedExpression = formattedChoices[0];
        }

        const getExpressionOccurrencesResult = await getExpressionOccurrences(
          buffer.getText(),
          ...selectedExpression.firstIndexRanges(),
        );

        const { expressions: occurrences } = getExpressionOccurrencesResult;
        const formattedOccurrences = [
          FxSelection.fromFxExpressionForBuffer(
            {
              ...occurrences[0],
              value: 'This occurrence only',
            },
            buffer,
          ),
          FxSelection.fromMultipleFxExpressionsForBuffer(
            `All ${occurrences.length} occurrences`,
            occurrences,
            buffer,
          ),
        ];

        let selectedOccurrences;

        if (occurrences.length > 1) {
          selectedOccurrences = await this.selectList.open(formattedOccurrences);
        } else {
          selectedOccurrences = formattedOccurrences[0];
        }

        const extractVariableResult = await extractVariable(
          type,
          buffer.getText(),
          ...selectedOccurrences.indexRanges(),
        );

        this.replaceCodeWithResult(extractVariableResult);
      } catch (e) {
        if (e.name === 'ExpressionNotFoundError') {
          atom.notifications.addWarning("Didn't find an expression here :/");
        } else {
          atom.notifications.addError('Something went wrong :(');
          // eslint-disable-next-line no-console
          console.error(e);
          throw e;
        }
      }
    })();
  };

  renameVariableFlow = () => {
    this.createFlow(async () => {
      try {
        const newVarName = await this.variableInput.open('');
        const renameResult = await renameVariable(
          this.editor.getBuffer().getText(),
          ...FxSelection.current(this.editor).firstIndexRanges(),
          newVarName,
        );
        this.replaceCodeWithResult(renameResult, this.editor);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  };

  createFlow = (flow: Function) => () => {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      this.editor = editor;
      flow();
    } else {
      // eslint-disable-next-line no-console
      console.error('Something went wrong!');
    }
  };

  replaceCodeWithResult(result: codeResult) {
    const cursorPositionPriorToFormat = this.editor.getCursorScreenPosition();
    const buffer = this.editor.getBuffer();
    buffer.setText(result.code);
    this.editor.setCursorBufferPosition(cursorPositionPriorToFormat);

    const ranges = result.cursorPositions.map(
      position =>
        FxSelection.fromFxExpressionForBuffer({ position, value: '' }, buffer).positions[0],
    );
    this.editor.setSelectedBufferRanges(ranges);
  }

  deactivate() {
    this.subscriptions.dispose();
  }
}

module.exports = new FactorX();
