// Node.js
import { debuglog } from 'util';
const debug = debuglog('on');

// 3rd party
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';

// 1st party
// import { RippleAPI } from 'ripple-lib';
// import * as cc from 'five-bells-condition';

// Internal
import {terminal, Commands} from './io';

if (!process.env.npm_package_name) {
  console.error('[ERROR] Use: npm start');
  console.error('         or: yarn start');
  process.exit(1);
}

const package_name = process.env.npm_package_name || '';
console.log(`Welcome to ${package_name.toUpperCase()} v${process.env.npm_package_version}.`);
console.log();
console.log(`Type ".help" for more information.`);

const help = (): string => {
    let help = '';
    for (let command in commands) {
      if (commands[command].length >= 2) {
        help += `${command.padEnd(10)} ${commands[command][1]}\n`;
      }
    }

    help += '\n';
    help += `Press ^C to abort current expression, ^D to exit the repl`;
    return help;
}

const exit = () => {
    process.exit(0);
}

type HttpRequestMethod = (url: string) => Promise<string>;

const httpRequest = (method: 'GET' | 'POST'): HttpRequestMethod => {
  return async (url: string): Promise<string> => {
    try {
      if (!url) {
        return chalk.red.bold(`Usage: ${method} <url>`);
      }
      const res = await axios({
        method,
        url
        // data
      });
      const style = res.status >= 200 && res.status <= 399 ? chalk.green : chalk.red;
      let ret = style.bold(`${res.status} ${res.statusText}`) + '\n';
      // res.method
      // res.path
      ret += JSON.stringify(res.data, null, 2);
      return ret;
    } catch (e) {
      return e.toString();
    }
  }
}

// Case insensitive
const commands: Commands = {
  '.help': [help, 'Print this help message'],
  '.exit': [exit, 'Exit the repl'],
  POST:    [httpRequest('POST'), 'Perform an HTTP POST request'],
  // P: [httpRequest('POST')], // alias
  GET:     [httpRequest('GET'), 'Perform an HTTP GET request'],
  // G: [httpRequest('GET')] // alias
}

const t = terminal();
t.onRead = async (input: string) => {
  const parts = input.split(' ');
  const command = parts[0];
  if (isValidCommand(command)) {
    const spinner = ora('Loading').start();
    const result = await (commands[command][0] as Function)(parts[1]);
    spinner.stop();
    console.log(result);
  } else {
    console.log(`Invalid REPL keyword`);
  }
};
t.commands = commands;

function isValidCommand(command: string | number): command is keyof typeof commands {
  return command in commands;
}

// Keeps service running after an exception
process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err);
});
