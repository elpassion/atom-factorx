'use babel';

// @flow

export const getPositionFromIndexesPosition = (
  buffer: atom$TextBuffer,
  { start, end }: { start: number, end: number },
)/* : atom$RangeLike */ => {
  const newStartPosition = buffer.positionForCharacterIndex(start);
  const newEndPosition = buffer.positionForCharacterIndex(end);

  return { start: newStartPosition, end: newEndPosition };
};

export const getIndexesPositionFromBufferPosition = (
  buffer: atom$TextBuffer,
  { start, end }: { start: atom$Point, end: atom$Point },
)/* : { start: number, end: number } */ => {
  const newStartPosition = buffer.characterIndexForPosition(start);
  const newEndPosition = buffer.characterIndexForPosition(end);

  return { start: newStartPosition, end: newEndPosition };
};
