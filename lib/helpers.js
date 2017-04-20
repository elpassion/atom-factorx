'use babel';

// @flow

export type IndexPosition = { start: number, end: number };
export type BufferPosition =
  | {
      start: atom$Point | atom$PointObject,
      end: atom$Point | atom$PointObject,
    }
  | atom$Range;

export const getPositionFromIndexesPosition = (
  buffer: atom$TextBuffer,
  { start, end }: IndexPosition,
) => {
  const newStartPosition = buffer.positionForCharacterIndex(start);
  const newEndPosition = buffer.positionForCharacterIndex(end);

  return { start: newStartPosition, end: newEndPosition };
};

export const getIndexesPositionFromBufferPosition = (
  buffer: atom$TextBuffer,
  bufferPosition: BufferPosition,
) => {
  const newStartPosition = buffer.characterIndexForPosition(bufferPosition.start);
  const newEndPosition = buffer.characterIndexForPosition(bufferPosition.end);

  return { start: newStartPosition, end: newEndPosition };
};
