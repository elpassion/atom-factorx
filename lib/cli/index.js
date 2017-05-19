'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractVariable = exports.getExpressionOccurrences = exports.getExpressions = exports.renameVariable = undefined;

var _executeCommand = require('./executeCommand');

var _executeCommand2 = _interopRequireDefault(_executeCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const renameVariable = exports.renameVariable = (input, startPosition, endPosition, newName) => (0, _executeCommand2.default)({
  command: 'rename-identifier',
  args: [startPosition, endPosition, newName],
  input
});

const getExpressions = exports.getExpressions = (input, startPosition, endPosition) => (0, _executeCommand2.default)({
  command: 'get-expressions',
  args: [startPosition, endPosition],
  input
});

const getExpressionOccurrences = exports.getExpressionOccurrences = (input, startPosition, endPosition) => (0, _executeCommand2.default)({
  command: 'get-expression-occurrences',
  args: [startPosition, endPosition],
  input
});

const extractVariable = exports.extractVariable = (type, input, ...positions) => (0, _executeCommand2.default)({
  command: `extract-${type}`,
  args: positions,
  input
});