'use babel';

const defaults = {
  offsetTop: 15
};

export default class SelectList {
  constructor(options = {}) {
    this.settings = Object.assign({}, options, defaults);
    this.handleChoice = this.handleChoice.bind(this);

    this.buildContainer();
  }

  buildContainer() {
    this.element = document.createElement('div');
    this.element.classList.add('fx-selectList');

    const choiceList = document.createElement('ul');
    choiceList.classList.add('fx-selectList-choices');
  }

  add(position, choices, container, callback) {
    const { x, y } = position;

    this.element.style.top = `${y + this.offsetTop}px`;
    this.element.style.left = `${x}px`;

    container.appendChild(this.element);

    this.onChange = (e) => {
      this.handleChoice(e, callback);
    };

    this.element.addEventListener('change', this.onChange);

    this.settings.choices = choices;

    this.buildList();
  }

  destroy() {
    this.element.removeEventListener('change', this.onChange);
    this.destroyList();
  }

  handleChoice(e, callback) {
    const isInput = (e.target.nodeName.toLowerCase() === 'input');

    if (isInput && e.target.checked === true) {
      callback(e.target.value);
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

  listItemTemplate(value) {
    return `
      <label class="fx-selectList-choices__label">
        <input type="radio" class="fx-selectList-choices__radio" name="fx-selectList-declaration" value=${value}>
        <span class="fx-selectList-choice__text">${value}</span>
      </label>
    `;
  }

  listItem(value) {
    const item = document.createElement('li');

    item.classList.add('fx-selectList-choices__item');
    item.innerHTML = this.listItemTemplate(value);

    return item;
  }
}
