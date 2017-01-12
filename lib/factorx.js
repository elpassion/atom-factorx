'use babel';

import Tooltip from './tooltip';
import { CompositeDisposable } from 'atom';

export default {

  editor: null,
  editorView: null,
  tooltip: null,
  tooltipState: null,
  subscriptions: null,

  activate(state) {
    this.tooltip = new Tooltip();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'factorx:run': () => this.run()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.tooltip.destroy();
  },

  serialize() {
    return {
      tooltipState: this.tooltip.serialize()
    };
  },

  run() {
    if (this.editor = atom.workspace.getActiveTextEditor()) {
      this.editorView = atom.views.getView(this.editor);
      this.cursor = this.editor.getLastCursor();

      if (this.cursor.isInsideWord()) {
        const { top, left } = this.editorView.pixelPositionForBufferPosition(this.cursor.getBufferPosition());
        this.tooltip.add(left, top, this.editorView);

        this.tooltip.getChoice = (choice) => {
          this.editor.insertText(choice);
          this.tooltip.destroy();
        };
      }
    }
  },


};
