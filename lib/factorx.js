'use babel';

import SelectList from './select-list';
import { CompositeDisposable, BufferedProcess } from 'atom';
import { spawnSync } from 'child_process';

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
    const choices = [
      'let',
      'var',
      'const'
    ];

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

      this.executeCommand({
        command: this.flowFactorPath,
        args: ['getExpressions', ...args],
        options: {},
        input: buffer,
        onMessage: this.handleExpressionsRes.bind(this)
      });
    }
  },

  handleExpressionsRes(data) {
    const choices = this.parseExpressionsList(data.expressions);

    this.selectList.add(this.getCursorPosition(), choices, this.editorView, (choice) => {
      this.editor.insertText(choice);
      this.selectList.destroy();
    });
  },

  getCursorPosition() {
    const { top, left } = this.editorView.pixelPositionForScreenPosition(this.cursor.getScreenPosition());

    return {
      x: left - this.editorView.getScrollLeft(),
      y: top - this.editorView.getScrollTop()
    };
  },

  executeCommand({command, args, options, input, onMessage}) {
    let bufferedProcess
    try {
      bufferedProcess = new BufferedProcess({ command, args, options,
        stdout: (data) => {
          console.log(data);
          try {
            const parsedData = JSON.parse(data);
            onMessage(parsedData);
          } catch(e) {
            atom.confirm({message: `Flow Factor failed: ${e}`})
          }
        },
        stderr: (data) => { console.error(data) },
        exit: () => {}
      })
    } catch (error) {
      console.error(error)
      atom.confirm({message: "Flow command not found"})
      return
    }
    bufferedProcess.process.stdin.end(input)
    bufferedProcess.process.on('error', (nodeError) => {
      console.error("Errow running flow utility: " + nodeError)
    })
  },

  getFlowFactorCommand() {
    this.flowFactorPath = atom.config.get('factorx.flowFactorPath');
    if (!this.flowFactorPath) {
      const flowFactorCommand = spawnSync('which', ['flow-factor']).stdout.toString().trim();

      if (flowFactorCommand) {
        atom.config.set('factorx.flowFactorPath', flowFactorCommand);
        this.flowFactorPath = flowFactorCommand;
      } else {
        console.error('Could not find a "flow-factor" binary on your PATH, go to package settings and set proper "Flow Factor Path"');
      }
    }
  },

  parseExpressionsList(list) {
    return list.map((item, index) => {
      const {
        value,
        selection: {
          start,
          end
        }
      } = item;

      return {
        id: index,
        label: item.value,
        selection: {
          start: {
            row: start.line,
            column: start.column
          },
          end: {
            row: end.line,
            column: end.column
          }
        }
      };
    });
  }
};
