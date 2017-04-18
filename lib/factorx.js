'use babel';

// @flow

import { CompositeDisposable } from 'atom';
import store from './store';

class FactorX {
  subscriptions: Object;
  store: typeof store;

  constructor() {
    this.store = store;
  }

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'factorx:extractVariable': () => this.run(),
      }),
    );
  }

  run() {
    console.log('a');
  }

  deactivate() {
    this.subscriptions.dispose();
  }
}

export default new FactorX();
