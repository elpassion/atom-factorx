'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _atom = require('atom');

var _VariableInput = require('./VariableInput');

var _VariableInput2 = _interopRequireDefault(_VariableInput);

var _SelectList = require('./SelectList');

var _SelectList2 = _interopRequireDefault(_SelectList);

var _cli = require('./cli');

var _FxSelection = require('./FxSelection');

var _FxSelection2 = _interopRequireDefault(_FxSelection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions


class FactorX {
  constructor() {
    var _this = this;

    this.extractVariableFlow = type => {
      this.createFlow(_asyncToGenerator(function* () {
        try {
          const buffer = _this.editor.getBuffer();
          const getExpressionsResult = yield (0, _cli.getExpressions)(buffer.getText(), ..._FxSelection2.default.current(_this.editor).firstIndexRanges());
          const { expressions } = getExpressionsResult;
          const formattedChoices = expressions.map(function (expression) {
            return _FxSelection2.default.fromFxExpressionForBuffer(expression, buffer);
          });

          let selectedExpression;

          if (expressions.length > 1) {
            selectedExpression = yield _this.selectList.open(formattedChoices);
          } else {
            selectedExpression = formattedChoices[0];
          }

          const getExpressionOccurrencesResult = yield (0, _cli.getExpressionOccurrences)(buffer.getText(), ...selectedExpression.firstIndexRanges());

          const { expressions: occurrences } = getExpressionOccurrencesResult;
          const formattedOccurrences = [_FxSelection2.default.fromFxExpressionForBuffer(_extends({}, occurrences[0], {
            value: 'This occurrence only'
          }), buffer), _FxSelection2.default.fromMultipleFxExpressionsForBuffer(`All ${occurrences.length} occurrences`, occurrences, buffer)];

          let selectedOccurrences;

          if (occurrences.length > 1) {
            selectedOccurrences = yield _this.selectList.open(formattedOccurrences);
          } else {
            selectedOccurrences = formattedOccurrences[0];
          }

          const extractVariableResult = yield (0, _cli.extractVariable)(type, buffer.getText(), ...selectedOccurrences.indexRanges());

          _this.replaceCodeWithResult(extractVariableResult);
        } catch (e) {
          if (e.name === 'ExpressionNotFoundError') {
            atom.notifications.addWarning("Didn't find an expression here :/");
          } else {
            atom.notifications.addError('Something went wrong :(');
            // eslint-disable-next-line no-console
            console.error(e);
            throw e;
          }
        }
      }))();
    };

    this.renameVariableFlow = () => {
      this.createFlow(_asyncToGenerator(function* () {
        try {
          const newVarName = yield _this.variableInput.open('');
          const renameResult = yield (0, _cli.renameVariable)(_this.editor.getBuffer().getText(), ..._FxSelection2.default.current(_this.editor).firstIndexRanges(), newVarName);
          _this.replaceCodeWithResult(renameResult, _this.editor);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }))();
    };

    this.createFlow = flow => () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        this.editor = editor;
        flow();
      } else {
        // eslint-disable-next-line no-console
        console.error('Something went wrong!');
      }
    };
  }

  activate() {
    this.subscribeToEvents();
    this.buildElements();
  }

  subscribeToEvents() {
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'factorx:extractVariable': () => this.extractVariableFlow('variable'),
      'factorx:extractConstant': () => this.extractVariableFlow('constant'),
      'factorx:renameVariable': () => this.renameVariableFlow()
    }));
  }

  buildElements() {
    if (!this.variableInput) {
      this.variableInput = new _VariableInput2.default();
    }
    if (!this.selectList) {
      this.selectList = new _SelectList2.default();
    }
  }

  replaceCodeWithResult(result) {
    const cursorPositionPriorToFormat = this.editor.getCursorScreenPosition();
    const buffer = this.editor.getBuffer();
    buffer.setText(result.code);
    this.editor.setCursorBufferPosition(cursorPositionPriorToFormat);

    const ranges = result.cursorPositions.map(position => _FxSelection2.default.fromFxExpressionForBuffer({ position, value: '' }, buffer).positions[0]);
    this.editor.setSelectedBufferRanges(ranges);
  }

  deactivate() {
    this.subscriptions.dispose();
  }
}

module.exports = new FactorX();