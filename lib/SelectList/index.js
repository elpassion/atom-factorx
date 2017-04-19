'use babel';

import { OFFSET_TOP } from '../constants';

export default class SelectList {
  domElement: HTMLElement;
  selectList: HTMLElement;
  parentEditor: atom$TextEditor;
  resolveInputPromise: (newVarName: string) => void;
  rejectInputPromise: () => void;

  constructor() {
    this.chosenIndex = 0;
    this.buildContainer();
  }

  createDomElement() {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('fx-selectList');
    this.domElement.setAttribute('tabindex', '-1');
  }

  open(choices) {
    const inputPromise = new Promise((resolve, reject) => {
      this.resolveInputPromise = resolve;
      this.rejectInputPromise = reject;
    });

    const parentEditor = atom.workspace.getActiveTextEditor();
    if (parentEditor) {
      this.parentEditor = parentEditor;
      this.setupDomElement();
      this.appendDomElementToView();
      this.createList(choices);
    }

    //
    // this.element.style.top = `${y + this.settings.offsetTop}px`;
    // this.element.style.left = `${x}px`;
    //
    // this.container.appendChild(this.element);
    //
    // this.resolveInputPromise = callback;
    //
    // this.element.addEventListener('change', this.handleChoice);
    // this.container.addEventListener('keyup', this.handleKeyUp, false);
    // this.container.addEventListener('keydown', this.handleKeyDown, false);
    //
    // this.settings.choices = choices;
    //
    // this.buildList();
    //
    // this.element.querySelector('input').classList.add('is-focused');
    // this.updateEditorSelection(this.chosenIndex);
  }

  setupDomElement = () => {
    const cursor = this.parentEditor.getLastCursor();
    const editorView = atom.views.getView(this.parentEditor);
    const { top, left } = editorView.pixelPositionForBufferPosition(cursor.getBufferPosition());
    const x = left - editorView.getScrollLeft();
    const y = top - editorView.getScrollTop();
    this.domElement.style.top = `${y + OFFSET_TOP}px`;
    this.domElement.style.left = `${x}px`;
    this.domElement.style.width = '100px';
  }

  destroy() {
    this.chosenIndex = 0;

    this.container.removeEventListener('keyup', this.handleKeyUp, false);
    this.container.removeEventListener('keydown', this.handleKeyDown, false);
    this.element.removeEventListener('change', this.handleChoice);

    this.clearEditorSelection();
    this.destroyList();
  }

  setTextEditor(editor) {
    this.settings.editor = editor;
  }

  handleKeyUp = (e) => {
    return e.stopPropagation();
  }

  handleKeyDown = (e) => {
    const {keyIdentifier, key} = e;
    const keyName = keyIdentifier.toLowerCase();

    if (key.toLowerCase() === 'escape') {
      this.destroy();
      return;
    }

    this.navigateTroughList(keyName);

    return e.stopPropagation();
  }

  navigateTroughList(direction) {
    const choiceInputs = this.choiceList.querySelectorAll('input');

    choiceInputs[this.chosenIndex].classList.remove('is-focused');

    switch (direction) {
      case 'up':
        this.chosenIndex > 0 && this.chosenIndex--;
        break;
      case 'down':
        this.chosenIndex < choiceInputs.length - 1 && this.chosenIndex++;
        break;

      case 'enter':
        choiceInputs[this.chosenIndex].checked = true;
        this.callback(this.getSelectedChoice(this.chosenIndex));
        return;

      default:
        return;
    }

    choiceInputs[this.chosenIndex].classList.add('is-focused');
    this.updateEditorSelection(this.chosenIndex);
  }

  updateEditorSelection(chosenId) {
    const {editor} = this.settings;
    const buffer = editor.getBuffer();
    const choice = this.getSelectedChoice(chosenId);
    const positions = Array.isArray(choice.position)
      ? choice.position
      : [choice.position];
    const ranges = positions.map(position => {
      return {
        start: buffer.positionForCharacterIndex(position.start),
        end: buffer.positionForCharacterIndex(position.end),
      };
    });
    this.settings.editor.setSelectedBufferRanges(ranges);
  }

  clearEditorSelection() {
    const {editor} = this.settings;
    const selection = editor.getLastSelection();

    if (selection) { selection.clear(); }
  }

  createList(choices) {
    this.selectList = document.createElement('ul');
    this.selectList.classList.add('fx-selectList-choices');

    choices.forEach((choice) => {
      this.selectList.appendChild(this.listItem(choice));
    });

    this.domElement.appendChild(this.selectList);
  }

  destroyList() {
    if (this.selectList) this.selectList.remove();
  }

  listItemTemplate({ id, label }) {
    return `
      <label class="fx-selectList-choices__label">
        <input type="radio" class="fx-selectList-choices__radio" name="fx-selectList-declaration" value=${id}>
        <span class="fx-selectList-choices__text">${label}</span>
      </label>
    `;
  }

  listItem(value) {
    const item = document.createElement('li');

    item.classList.add('fx-selectList-choices__item');
    item.innerHTML = this.listItemTemplate(value);

    return item;
  }

  getSelectedChoice(id) {
    return this.settings.choices.find(choice => choice.id === id);
  }
}
