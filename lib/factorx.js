'use babel';

import {CompositeDisposable} from 'atom';
import {spawnSync} from 'child_process';

import SelectList from './select-list';
import {
  executeCommand,
  parseExpressionsList,
  mapBufferRange,
} from './cli-helpers';

export default {
  editor: null,
  editorView: null,
  tooltip: null,
  tooltipState: null,
  subscriptions: null,

  activate(state) {
    this.selectList = new SelectList();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'factorx:run': () => this.run(),
      }),
    );

    this.getFlowFactorCommand();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.selectList.destroy();
  },

  run() {
    if ((this.editor = atom.workspace.getActiveTextEditor())) {
      const location = this.editor.getSelectedBufferRange();

      const buffer = this.editor.getBuffer();
      const text = buffer.getText();
      const args = [
        buffer.characterIndexForPosition(location.start),
        buffer.characterIndexForPosition(location.end),
      ];

      this.editorView = atom.views.getView(this.editor);
      this.cursor = this.editor.getLastCursor();

      this.selectList.setTextEditor(this.editor);
      executeCommand({
        command: this.flowFactorPath,
        args: ['get-expressions', ...args],
        options: {},
        input: text,
        onMessage: this.handleExpressionsRes.bind(this),
      });
    }
  },

  handleExpressionsRes(data) {
    console.log(data);
    const handleChoice = choice => {
      const buffer = this.editor.getBuffer();
      const text = buffer.getText();
      const args = [choice.position.start, choice.position.end];

      executeCommand({
        command: this.flowFactorPath,
        args: ['get-expression-occurrences', ...args],
        options: {},
        input: text,
        onMessage: this.handleGetExpressionOccurrences.bind(this),
      });
    };
    const choices = parseExpressionsList(data.expressions);
    if (choices.length === 1) {
      handleChoice(choices[0]);
      return;
    } else {
      this.selectList.add(
        this.getCursorPosition(),
        choices,
        this.editorView,
        handleChoice,
      );
    }
  },

  handleGetExpressionOccurrences(data) {
    const buffer = this.editor.getBuffer();
    const text = buffer.getText();
    if (this.selectList) this.selectList.destroy();

    if (data.expressions.length === 1) {
      const {position: {start, end}} = data.expressions[0];
      executeCommand({
        command: this.flowFactorPath,
        args: ['extract-variable', start, end],
        options: {},
        input: text,
        onMessage: this.handleExtractRes.bind(this),
      });
    } else {
      const choices = [
        {
          id: 0,
          label: `This occurrence only`,
          position: data.expressions[0].position,
        },
        {
          id: 1,
          label: `All ${data.expressions.length} occurrences`,
          position: data.expressions.map(expression => expression.position),
        },
      ];
      this.selectList.add(
        this.getCursorPosition(),
        choices,
        this.editorView,
        choice => {
          this.selectList.destroy();
          const positions = Array.isArray(choice.position)
            ? choice.position
            : [choice.position];
          const args = positions.reduce(
            (acc, position) => [...acc, position.start, position.end],
            [],
          );
          console.log(args);
          executeCommand({
            command: this.flowFactorPath,
            args: ['extract-variable', ...args],
            options: {},
            input: text,
            onMessage: this.handleExtractRes.bind(this),
          });
        },
      );
    }
  },

  handleExtractRes(data) {
    console.log(data);
    const buffer = this.editor.getBuffer();
    buffer.setText(data.code);
    if (this.selectList) this.selectList.destroy();
    // const textBuffer = this.editor.getBuffer();
    //
    // this.selectList.destroy();
    //
    // textBuffer.scan(/_ref/g, ({range}) => {
    //   console.log(range);
    //   setTimeout(
    //     () => {
    //       this.editor.addSelectionForBufferRange(range);
    //     },
    //     100,
    //   );
    // });
  },

  makeOperation(operation) {
    const range = this.getOperationRange(operation);

    this.editor.setTextInBufferRange(range, operation.code);
  },

  getOperationRange({type, at}) {
    switch (type) {
      case 'replace':
        return mapBufferRange(at);
      case 'add':
        return {
          start: {
            row: at.line,
            column: at.column + 1,
          },
          end: {
            row: at.line,
            column: at.column + 1,
          },
        };
    }
  },

  getCursorPosition() {
    const {top, left} = this.editorView.pixelPositionForScreenPosition(
      this.cursor.getScreenPosition(),
    );

    return {
      x: left - this.editorView.getScrollLeft(),
      y: top - this.editorView.getScrollTop(),
    };
  },

  getFlowFactorCommand() {
    this.flowFactorPath = atom.config.get('factorx.flowFactorPath');

    if (!this.flowFactorPath) {
      const flowFactorCommand = spawnSync('which', ['factorx']).stdout
        .toString()
        .trim();

      if (flowFactorCommand) {
        atom.config.set('factorx.flowFactorPath', flowFactorCommand);
        this.flowFactorPath = flowFactorCommand;
      } else {
        atom.confirm({
          message: 'Could not find a "factorx" binary on your PATH, go to package settings and set proper "Flow Factor Path"',
        });
      }
    }
  },
};
