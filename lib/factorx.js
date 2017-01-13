'use babel';

import SelectList from './select-list';
import { CompositeDisposable, BufferedProcess } from 'atom';

const FLOW_FACTOR_CLI_PATH = `${__dirname}/../node_modules/.bin/flow-factor.js`;

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

      console.log(location);

      this.executeCommand({
        command: FLOW_FACTOR_CLI_PATH,
        args: ['getExpressions', ...args],
        options: {
          env: process.env
        },
        input: buffer,
        onMessage: (data) => {
          console.log(data);
        }
      });

      // if (this.cursor.isInsideWord()) {
      //   this.selectList.add(this.getCursorPosition(), choices, this.editorView, (choice) => {
      //     this.editor.insertText(choice);
      //     this.selectList.destroy();
      //   });
      // }
    }
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
  }
};
