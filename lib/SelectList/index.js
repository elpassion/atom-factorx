'use babel';

// @flow

import { OFFSET_TOP } from '../constants';

export default class SelectList {
  chosenIndex: number;
  domElement: HTMLElement;
  selectList: HTMLElement;
  parentEditor: atom$TextEditor;
  resolveInputPromise: (choice: any) => void;
  rejectInputPromise: () => void;
  choices: Array<any>;

  constructor() {
    this.chosenIndex = 0;
    this.createDomElement();
  }

  createDomElement() {
    this.domElement = document.createElement('div');
    this.domElement.classList.add('fx-selectList');
    this.domElement.setAttribute('tabindex', '-1');
  }

  open(choices: Array<any>) {
    this.choices = choices;
    const inputPromise = new Promise((resolve, reject) => {
      this.resolveInputPromise = resolve;
      this.rejectInputPromise = reject;
    });

    const parentEditor = atom.workspace.getActiveTextEditor();
    if (parentEditor) {
      this.parentEditor = parentEditor;
      this.setupDomElement();
      this.appendDomElementToView();
      this.createList();
    }

    return inputPromise;
  }

  close() {
    this.deattachEvents();
    this.removeList();
    this.focusParentEditor();
  }

  setupDomElement = () => {
    const cursor = this.parentEditor.getLastCursor();
    const editorView = atom.views.getView(this.parentEditor);
    const { top, left } = editorView.pixelPositionForBufferPosition(cursor.getBufferPosition());
    const x = left - editorView.getScrollLeft();
    const y = top - editorView.getScrollTop();
    this.domElement.style.top = `${y + OFFSET_TOP}px`;
    this.domElement.style.left = `${x}px`;
  }

  appendDomElementToView = () => {
    const editorView = atom.views.getView(this.parentEditor);
    editorView.appendChild(this.domElement);
  }

  focusParentEditor() {
    const editorView = atom.views.getView(this.parentEditor);
    editorView.focus();
  }

  createList() {
    this.selectList = document.createElement('ul');
    this.selectList.classList.add('fx-selectList-choices');

    this.choices.forEach((choice, index) => {
      this.selectList.appendChild(this.listItem(choice.value, index));
    });

    this.domElement.appendChild(this.selectList);
    this.attachEvents();
    this.updateEditorSelection(this.chosenIndex);
  }

  removeList() {
    this.selectList.remove();
    this.chosenIndex = 0;
  }

  // eslint-disable-next-line class-methods-use-this
  listItem(value: string, index: number) {
    const item = document.createElement('li');
    item.classList.add('fx-selectList-choices__item');
    item.innerHTML = `
      <label class="fx-selectList-choices__label">
        <input type="radio" class="fx-selectList-choices__radio" name="fx-selectList-declaration" value=${index}>
        <span class="fx-selectList-choices__text">${value}</span>
      </label>
    `;
    return item;
  }

  attachEvents() {
    this.domElement.addEventListener('change', this.handleChoice);
    const editorView = atom.views.getView(this.parentEditor);
    editorView.addEventListener('keyup', this.handleKeyUp, false);
    editorView.addEventListener('keydown', this.handleKeyDown, false);
  }

  deattachEvents() {
    this.domElement.removeEventListener('change', this.handleChoice);
    const editorView = atom.views.getView(this.parentEditor);
    editorView.removeEventListener('keyup', this.handleKeyUp, false);
    editorView.removeEventListener('keydown', this.handleKeyDown, false);
  }

  updateEditorSelection() {
    const choice = this.choices[this.chosenIndex];
    const position = Array.isArray(choice.position)
      ? choice.position
      : [choice.position];
    const choiceInputs = this.selectList.querySelectorAll('input');
    choiceInputs[this.chosenIndex].classList.add('is-focused');
    this.parentEditor.setSelectedBufferRanges(position);
  }

  handleChoice = (e: Event) => {
    const target: HTMLInputElement = (e.target: any);
    const isInput = target.nodeName.toLowerCase() === 'input';

    if (isInput && target.checked === true) {
      // eslint-disable-next-line no-console
      console.log(target.value);
    }
  }

  handleKeyUp = (e: Event) => e.stopPropagation();

  handleKeyDown = (e: KeyboardEvent) => {
    const keyName = e.key.toLowerCase();
    if (keyName.toLowerCase() === 'escape') {
      this.rejectInputPromise();
      this.close();
      return;
    }
    this.navigateTroughList(keyName);
    e.stopPropagation();
  }

  navigateTroughList(direction: string) {
    const choiceInputs: Array<HTMLInputElement> = (this.selectList.querySelectorAll('input'): any);

    choiceInputs[this.chosenIndex].classList.remove('is-focused');

    switch (direction) {
      case 'arrowup':
        if (this.chosenIndex > 0) this.chosenIndex -= 1;
        break;
      case 'arrowdown':
        if (this.chosenIndex < choiceInputs.length - 1) this.chosenIndex += 1;
        break;
      case 'enter':
        choiceInputs[this.chosenIndex].checked = true;
        this.resolveInputPromise(this.choices[this.chosenIndex]);
        this.close();
        return;
      default:
        return;
    }

    this.updateEditorSelection();
  }
}
