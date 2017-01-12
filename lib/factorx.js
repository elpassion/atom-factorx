'use babel';

import FactorxView from './factorx-view';
import { CompositeDisposable } from 'atom';

export default {

  factorxView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.factorxView = new FactorxView(state.factorxViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.factorxView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'factorx:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.factorxView.destroy();
  },

  serialize() {
    return {
      factorxViewState: this.factorxView.serialize()
    };
  },

  toggle() {
    console.log('Factorx was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
