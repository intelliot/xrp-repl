// Node.js
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer,
  terminal: true
});

export interface Commands {
  [index: string]: (Function | string)[]
}

// Via @types/node:
// type AsyncCompleter = (line: string, callback: (err?: null | Error, result?: CompleterResult) => void) => any;
type CompleterResult = [string[], string];

// A function used for Tab autocompletion.
function completer(line: string, callback: (err?: null | Error, result?: CompleterResult) => void): any {
  const completions = Object.keys(io.commands);
  const hits = completions.reduce((accumulator: string[], currentValue: string) => {
    if(currentValue.toLowerCase().startsWith(line.toLowerCase())) {
      if (currentValue.startsWith('.') === false) {
        currentValue += ' '; // Add space after GET, POST, etc.
      }
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []);
  callback(null, [hits.length ? hits : [], line]);
}

// ^[[A should cycle through history...
//   and circle back around at the end.

const io: {
  onRead: Function,
  commands: Commands
} = {
  onRead: (_: string) => {},
  commands: {
    COMMAND: [() => {}, 'Description']
  }
}

rl.on('line', async (input: string) => {
  did_sigint = false;
  await io.onRead(input);
  rl.prompt();
});

readline.emitKeypressEvents(process.stdin)
process.stdin.on('keypress', (str: string, key: {ctrl: boolean}) => {
  // ctrl+c =
  //   {"sequence":"\u0003","name":"c","ctrl":true,"meta":false,"shift":false}
  if (key.ctrl === false) {
    did_sigint = false;
  }
});

// Handle <ctrl>-C (SIGINT) with 'SIGINT' event listener registered on the readline.Interface instance.
let did_sigint = false;
rl.on('SIGINT', () => {
  console.log();
  if (did_sigint) {
    process.exit(0);
  }
  console.log('(To exit, press ^C again or ^D or type .exit)');
  did_sigint = true;

  // Simulate Ctrl+u to delete the line written previously
  rl.write('', { ctrl: true, name: 'u' });

  // Simulate Ctrl+u to delete the text written after the cursor
  rl.write('', { ctrl: true, name: 'k' });
});

export function terminal() {
  rl.prompt();
  return io;
}
