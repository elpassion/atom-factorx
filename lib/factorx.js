'use babel';

import { CompositeDisposable } from 'atom';
import { spawnSync } from 'child_process';

import SelectList from './select-list';
import { executeCommand, parseExpressionsList, mapBufferRange } from './cli-helpers';


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
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'factorx:run': () => this.run()
    }));

    this.getFlowFactorCommand();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.selectList.destroy();
  },

  run() {
    if (this.editor = atom.workspace.getActiveTextEditor()) {
      const location = this.editor.getSelectedBufferRange();
      const buffer = this.editor.getText();
      const args = [
        location.start.row,
        location.start.column,
        location.end.row,
        location.end.column
      ];

      this.editorView = atom.views.getView(this.editor);
      this.cursor = this.editor.getLastCursor();

      this.selectList.setTextEditor(this.editor);

      executeCommand({
        command: this.flowFactorPath,
        args: ['getExpressions', ...args],
        options: {},
        input: buffer,
        onMessage: this.handleExpressionsRes.bind(this)
      });
    }
  },

  handleExpressionsRes(data) {
    const choices = parseExpressionsList(data.expressions);

    this.selectList.add(this.getCursorPosition(), choices, this.editorView, (choice) => {
      const buffer = this.editor.getText();
      const args = [
        choice.selection.start.row,
        choice.selection.start.column,
        choice.selection.end.row,
        choice.selection.end.column
      ];

      executeCommand({
        command: this.flowFactorPath,
        args: ['getExtract', ...args],
        options: {},
        input: buffer,
        onMessage: this.handleExtractRes.bind(this)
      });
    });
  },

  handleExtractRes(operations) {
    operations.forEach(operation => {
      this.makeOperation(operation);
    });

    const textBuffer = this.editor.getBuffer();

    this.selectList.destroy();

    textBuffer.scan(/_ref/g, ({range}) => {
      console.log(range);
      setTimeout(() => {
        this.editor.addSelectionForBufferRange(range);
      }, 100);
    });
  },

  makeOperation(operation) {
    const range = this.getOperationRange(operation);

    this.editor.setTextInBufferRange(range, operation.code);
  },

  getOperationRange({ type, at }) {
    switch (type) {
      case 'replace':
        return mapBufferRange(at);
      case 'add':
        return {
          start: {
            row: at.line,
            column: at.column + 1
          },
          end: {
            row: at.line,
            column: at.column + 1
          }
        };
    }
  },

  getCursorPosition() {
    const { top, left } = this.editorView.pixelPositionForScreenPosition(this.cursor.getScreenPosition());

    return {
      x: left - this.editorView.getScrollLeft(),
      y: top - this.editorView.getScrollTop()
    };
  },

  getFlowFactorCommand() {
    this.flowFactorPath = atom.config.get('factorx.flowFactorPath');

    if (!this.flowFactorPath) {
      const flowFactorCommand = spawnSync('which', ['flow-factor']).stdout.toString().trim();

      if (flowFactorCommand) {
        atom.config.set('factorx.flowFactorPath', flowFactorCommand);
        this.flowFactorPath = flowFactorCommand;
      } else {
        atom.confirm({
          message: 'Could not find a "flow-factor" binary on your PATH, go to package settings and set proper "Flow Factor Path"'
        });
      }
    }
  }
};
