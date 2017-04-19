'use babel';

// @flow

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import { CompositeDisposable } from 'atom';
// import store from './store';

class FactorX {
  subscriptions: atom$CompositeDisposable;
  store: Object

  // constructor() {
    // this.store = store;
  // }

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'factorx:extractVariable': () => this.run(),
      }),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  run() {}

  deactivate() {
    this.subscriptions.dispose();
  }
}

export default new FactorX();
