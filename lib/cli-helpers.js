'use babel';

import {BufferedProcess} from 'atom';

export function executeCommand({command, args, options, input, onMessage}) {
  let bufferedProcess;
  try {
    bufferedProcess = new BufferedProcess({
      command,
      args,
      options,
      stdout: data => {
        console.log(data);
        try {
          const parsedData = JSON.parse(data);
          onMessage(parsedData);
        } catch (e) {
          atom.confirm({message: `Flow Factor failed: ${e}`});
        }
      },
      stderr: data => {
        console.error(data);
      },
      exit: () => {},
    });
  } catch (error) {
    console.error(error);
    atom.confirm({message: 'Flow command not found'});
    return;
  }
  bufferedProcess.process.stdin.end(input);
  bufferedProcess.process.on('error', nodeError => {
    console.error('Errow running flow utility: ' + nodeError);
  });
}

export function parseExpressionsList(list) {
  return list.map((item, index) => {
    const {
      value,
      position,
    } = item;

    return {
      id: index,
      label: item.value,
      position,
    };
  });
}
