'use babel';

import SelectList from './select-list';
import { CompositeDisposable } from 'atom';

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
      this.editorView = atom.views.getView(this.editor);
      this.cursor = this.editor.getLastCursor();

      if (this.cursor.isInsideWord()) {
        const { top: y, left: x } = this.editorView.pixelPositionForBufferPosition(this.cursor.getBufferPosition());

        this.selectList.add({ x, y }, choices, this.editorView, (choice) => {
          this.editor.insertText(choice);
          this.selectList.destroy();
        });
      }
    }
  },
};
