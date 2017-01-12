'use babel';

export default class Tooltip {
  constructor() {
    this.offsetTop = 15;

    this.possibleDeclarations = [
      'let',
      'var',
      'const'
    ];

    this.handleChoice = this.handleChoice.bind(this)

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('fx-tooltip');

    // Create message element
    const choices = document.createElement('ul');
    choices.classList.add('fx-tooltip-choices');

    this.possibleDeclarations.forEach((declaration) => {
      choices.appendChild(
        this.listItem(declaration)
      );
    });

    this.element.appendChild(choices);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  add(x, y, container) {
    this.element.style.top = `${y + this.offsetTop}px`;
    this.element.style.left = `${x}px`;

    container.appendChild(this.element);
    this.element.addEventListener('change', this.handleChoice);
  }

  // Tear down any state and detach
  destroy() {
    this.element.removeEventListener('change', this.handleChoice);
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  handleChoice(e) {
    const isInput = (e.target.nodeName.toLowerCase() === 'input');

    if (isInput && e.target.checked === true) {
      this.getChoice(e.target.value);
    }
  }

  getChoice() {}

  listItemTemplate(radioValue) {
    return `
      <label class="fx-tooltip-choices__label">
        <input type="radio" id="fx-choice-${radioValue}" name="fx-tooltip-declaration" value=${radioValue}>
        <span class="fx-choice__text">${radioValue}</span>
      </label>
    `;
  }

  listItem(radioValue) {
    const item = document.createElement('li');

    item.classList.add('fx-tooltip-choices__item');
    item.innerHTML = this.listItemTemplate(radioValue);

    return item;
  }
}
