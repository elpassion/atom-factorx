// @flow

type IndexPosition = { start: number, end: number };

type BufferPosition =
  | {
      start: atom$Point | atom$PointObject,
      end: atom$Point | atom$PointObject,
    }
  | atom$Range;

type FxExpression = {
  value: string,
  position: IndexPosition,
};

const getPositionsFromIndexesPositions = (
  buffer: atom$TextBuffer,
  positions: Array<IndexPosition>,
): Array<BufferPosition> =>
  positions.map(({ start, end }) => {
    const newStartPosition = buffer.positionForCharacterIndex(start);
    const newEndPosition = buffer.positionForCharacterIndex(end);

    return { start: newStartPosition, end: newEndPosition };
  });

const getIndexesPositionFromBufferPosition = (
  buffer: atom$TextBuffer,
  bufferPosition: BufferPosition,
): IndexPosition => {
  const newStartPosition = buffer.characterIndexForPosition(bufferPosition.start);
  const newEndPosition = buffer.characterIndexForPosition(bufferPosition.end);

  return { start: newStartPosition, end: newEndPosition };
};

export default class FxSelection {
  value: string;
  positions: Array<BufferPosition>;
  indexPositions: Array<IndexPosition>;

  constructor(
    value: string,
    positions: Array<BufferPosition>,
    indexPositions: Array<IndexPosition>,
  ) {
    this.value = value;
    this.positions = positions;
    this.indexPositions = indexPositions;
  }

  static current(editor: atom$TextEditor) {
    const buffer = editor.getBuffer();
    const position = editor.getSelectedBufferRange();
    const indexPosition = getIndexesPositionFromBufferPosition(buffer, position);
    return new FxSelection('', [position], [indexPosition]);
  }

  static fromFxExpressionForBuffer(fxExpression: FxExpression, buffer: atom$TextBuffer) {
    const positions = getPositionsFromIndexesPositions(buffer, [fxExpression.position]);
    return new FxSelection(fxExpression.value, positions, [fxExpression.position]);
  }

  static fromMultipleFxExpressionsForBuffer(
    value: string,
    fxExpressions: Array<FxExpression>,
    buffer: atom$TextBuffer,
  ) {
    const indexPositions = fxExpressions.map(expression => expression.position);
    const positions = getPositionsFromIndexesPositions(buffer, indexPositions);
    return new FxSelection(value, positions, indexPositions);
  }

  indexRanges() {
    return [...this.indexPositions].reduce(
      (acc, indexPosition) => [...acc, indexPosition.start, indexPosition.end],
      [],
    );
  }

  firstIndexRanges() {
    const { start, end } = this.indexPositions[0];
    return [start, end];
  }
}
