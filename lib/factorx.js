'use babel';

// @flow

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import { CompositeDisposable } from 'atom';
import VariableInput from './VariableInput';

class FactorX {
  subscriptions: atom$CompositeDisposable;
  variableInput: VariableInput;

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'factorx:extractVariable': () => this.variableInput.open('dupa'),
      }),
    );
    if (!this.variableInput) {
      this.variableInput = new VariableInput((text) => { console.log(text); });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  run() {}

  deactivate() {
    this.subscriptions.dispose();
  }
}

export default new FactorX();
