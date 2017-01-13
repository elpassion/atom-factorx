'use babel';

const EDITOR_FONT_SIZE = atom.config.get('editor.fontSize');
const EDITOR_LINE_HEIGHT = atom.config.get('editor.lineHeight');

const defaults = {
  offsetTop: EDITOR_FONT_SIZE * EDITOR_LINE_HEIGHT
};

export default class SelectList {
  constructor(options = {}) {
    this.settings = Object.assign({}, options, defaults);
    this.handleChoice = this.handleChoice.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.chosenIndex = 0;

    this.buildContainer();
  }

  buildContainer() {
    this.element = document.createElement('div');
    this.element.classList.add('fx-selectList');
    this.element.setAttribute('tabindex', '-1');

    const choiceList = document.createElement('ul');
    choiceList.classList.add('fx-selectList-choices');
  }

  add(position, choices, container, callback) {
    const { x, y } = position;

    this.container = container;

    this.element.style.top = `${y + this.settings.offsetTop}px`;
    this.element.style.left = `${x}px`;

    this.container.appendChild(this.element);

    this.callback = callback;

    this.element.addEventListener('change', this.handleChoice);
    this.container.addEventListener('keyup', this.handleKeyUp, false);
    this.container.addEventListener('keydown', this.handleKeyDown, false);

    this.settings.choices = choices;

    this.buildList();

    this.element.querySelector('input').classList.add('is-focused');
    this.updateEditorSelection(this.chosenIndex);
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

  handleChoice(e) {
    const isInput = (e.target.nodeName.toLowerCase() === 'input');

    if (isInput && e.target.checked === true) {
      this.callback(e.target.value);
    }
  }

  handleKeyUp(e) {
    return e.stopPropagation();
  }

  handleKeyDown(e) {
    const { keyIdentifier, key } = e;
    const keyName = keyIdentifier.toLowerCase();

    console.log(e);

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
        this.chosenIndex < (choiceInputs.length - 1) && this.chosenIndex++;
        break;

      case 'enter':
        choiceInputs[this.chosenIndex].checked = true;
        this.callback(choiceInputs[this.chosenIndex].value);
        return;

      default:
        return;
    }

    choiceInputs[this.chosenIndex].classList.add('is-focused');
    this.updateEditorSelection(this.chosenIndex);
  }

  updateEditorSelection(chosenId) {
    const { editor } = this.settings;
    const choice = this.getSelectedChoice(chosenId);

    this.settings.editor.setSelectedBufferRange(choice.selection);
  }

  clearEditorSelection() {
    const { editor } = this.settings;
    const selection = editor.getLastSelection();

    if (selection) {
      selection.clear();
    }
  }

  buildList() {
    const { choices } = this.settings;

    this.choiceList = document.createElement('ul');
    this.choiceList.classList.add('fx-selectList-choices');

    choices.forEach((choice) => {
      this.choiceList.appendChild(
        this.listItem(choice)
      );
    });

    this.element.appendChild(this.choiceList);
  }

  destroyList() {
    this.choiceList.remove();
    this.choiceList = null;
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
    return this.settings.choices.find((choice) => choice.id === id);
  }
}
