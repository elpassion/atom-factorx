'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


const getPositionsFromIndexesPositions = (buffer, positions) => positions.map(({ start, end }) => {
  const newStartPosition = buffer.positionForCharacterIndex(start);
  const newEndPosition = buffer.positionForCharacterIndex(end);

  return { start: newStartPosition, end: newEndPosition };
});

const getIndexesPositionFromBufferPosition = (buffer, bufferPosition) => {
  const newStartPosition = buffer.characterIndexForPosition(bufferPosition.start);
  const newEndPosition = buffer.characterIndexForPosition(bufferPosition.end);

  return { start: newStartPosition, end: newEndPosition };
};

class FxSelection {

  constructor(value, positions, indexPositions) {
    this.value = value;
    this.positions = positions;
    this.indexPositions = indexPositions;
  }

  static current(editor) {
    const buffer = editor.getBuffer();
    const position = editor.getSelectedBufferRange();
    const indexPosition = getIndexesPositionFromBufferPosition(buffer, position);
    return new FxSelection('', [position], [indexPosition]);
  }

  static fromFxExpressionForBuffer(fxExpression, buffer) {
    const positions = getPositionsFromIndexesPositions(buffer, [fxExpression.position]);
    return new FxSelection(fxExpression.value, positions, [fxExpression.position]);
  }

  static fromMultipleFxExpressionsForBuffer(value, fxExpressions, buffer) {
    const indexPositions = fxExpressions.map(expression => expression.position);
    const positions = getPositionsFromIndexesPositions(buffer, indexPositions);
    return new FxSelection(value, positions, indexPositions);
  }

  indexRanges() {
    return [...this.indexPositions].reduce((acc, indexPosition) => [...acc, indexPosition.start, indexPosition.end], []);
  }

  firstIndexRanges() {
    const { start, end } = this.indexPositions[0];
    return [start, end];
  }
}
exports.default = FxSelection;