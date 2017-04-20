'use babel';

// @flow

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
import { BufferedProcess } from 'atom';
import { spawnSync } from 'child_process';

let flowFactorPath: string;

const getFlowFactorCommand = () => {
  flowFactorPath =
    flowFactorPath ||
    ((atom.config.get('factorx.flowFactorPath'): any): string) ||
    spawnSync('which', ['factorx']).stdout.toString().trim();

  if (flowFactorPath) {
    atom.config.set('factorx.flowFactorPath', flowFactorPath);
    return flowFactorPath;
  }
  atom.confirm({
    message: 'Could not find "FactorX" binary.',
  });
  return null;
};

const executeCommand = ({
  command,
  args,
  input,
}: { command: string, args: Array<any>, input: string }) => {
  let bufferedProcess;
  return new Promise((resolve, reject) => {
    const flowCommand = getFlowFactorCommand();
    if (!flowCommand) reject('Could not find "FactorX" binary.');
    try {
      bufferedProcess = new BufferedProcess({
        command: flowCommand,
        args: [command, ...args],
        options: {},
        stdout: (data: string) => {
          try {
            const parsedData: { status: string } = JSON.parse(data);
            if (parsedData.status === 'ok') {
              resolve(parsedData);
            } else {
              reject(parsedData);
            }
          } catch (error) {
            reject(error);
          }
        },
        stderr: (data: string) => {
          reject(data);
        },
        exit: () => {},
      });
    } catch (error) {
      reject(error);
    }
    bufferedProcess.process.stdin.end(input);
    bufferedProcess.process.on('error', (nodeError) => {
      reject(nodeError);
    });
  });
};

// eslint-disable-next-line no-unused-vars
type renameVariableResult = {
  status: string,
  code: string,
  cursorPosition: {
    start: number,
    end: number,
  },
};

export const renameVariable = (
  input: string,
  startPosition: number,
  endPosition: number,
  newName: string,
) =>
  executeCommand({
    command: 'rename-identifier',
    args: [startPosition, endPosition, newName],
    input,
  });

type Expression = {
  value: string,
  position: {
    start: number,
    end: number,
  },
};

// eslint-disable-next-line no-unused-vars
type getExpressionsResult = {
  status: string,
  expressions: Array<Expression>,
};

export const getExpressions = (input: string, startPosition: number, endPosition: number) =>
  executeCommand({
    command: 'get-expressions',
    args: [startPosition, endPosition],
    input,
  });

// eslint-disable-next-line no-unused-vars
type getExpressionOccurrencesResult = {
  status: string,
  expressions: Array<Expression>,
};

export const getExpressionOccurrences = (
  input: string,
  startPosition: number,
  endPosition: number,
) =>
  executeCommand({
    command: 'get-expression-occurrences',
    args: [startPosition, endPosition],
    input,
  });

// eslint-disable-next-line no-unused-vars
type extractVariableResult = {
  status: string,
  code: string,
  cursorPosition: {
    start: number,
    end: number,
  },
};

export const extractVariable = (
  type: 'constant' | 'variable',
  input: string,
  ...positions: Array<number>
) =>
  executeCommand({
    command: `extract-${type}`,
    args: positions,
    input,
  });
