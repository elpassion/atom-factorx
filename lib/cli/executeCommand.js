'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _child_process = require('child_process');

// eslint-disable-next-line max-len
// eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved, import/extensions
let flowFactorPath;

const getFlowFactorCommand = () => {
  flowFactorPath = flowFactorPath || atom.config.get('factorx.flowFactorPath') || (0, _child_process.spawnSync)('which', ['factorx']).stdout.toString().trim();

  if (flowFactorPath) {
    atom.config.set('factorx.flowFactorPath', flowFactorPath);
    return flowFactorPath;
  }
  atom.confirm({
    message: 'Could not find "FactorX" binary.'
  });
  return null;
};

const executeCommand = ({
  command,
  args,
  input
}) => {
  let bufferedProcess;
  return new Promise((resolve, reject) => {
    const flowCommand = getFlowFactorCommand();
    if (!flowCommand) reject('Could not find "FactorX" binary.');
    try {
      bufferedProcess = new _atom.BufferedProcess({
        command: flowCommand,
        args: [command, ...args],
        options: {},
        stdout: data => {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.status === 'ok') {
              resolve(parsedData);
            } else {
              reject(parsedData.error);
            }
          } catch (error) {
            reject(error);
          }
        },
        stderr: data => {
          reject(data);
        },
        exit: () => {}
      });
    } catch (error) {
      reject(error);
    }
    bufferedProcess.process.stdin.end(input);
    bufferedProcess.process.on('error', nodeError => {
      reject(nodeError);
    });
  });
};

exports.default = executeCommand;