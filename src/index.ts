// Node.js
import { debuglog } from 'util';
const debug = debuglog('on');

// 3rd party
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import jsonic from 'jsonic';
import {argv} from 'yargs';

// Internal
import {terminal, Commands} from './io';
import {classicAddressToXAddress, sign, prepareTransaction} from './ripple-lib-commands';

if (!argv['authorization']) {
  console.warn('[WARNING] authorization not specified.');
} else {
  axios.defaults.headers.common['Authorization'] = argv['authorization'];
}

if (!argv['base-url']) {
  console.warn('[WARNING] base-url not specified.');
  console.warn('          Defaulting to: --base-url=http://localhost:3000/v1');
}

const baseUrl = argv['base-url'] || 'http://localhost:3000/v1';

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

type HttpRequestMethod = (url: string, bodyString: string) => Promise<string>;

const httpRequest = (method: 'GET' | 'POST'): HttpRequestMethod => {
  return async (url: string, bodyString: string): Promise<string> => {
    try {
      if (!url) {
        return chalk.red.bold(`Usage: ${method} <url>`);
      }
      const res = await axios({
        method,
        headers: {'Content-Type': 'application/json'},
        url: baseUrl + url,
        data: jsonic(bodyString)
      });
      const style = res.status >= 200 && res.status <= 399 ? chalk.green : chalk.red;
      let ret = style.bold(`${res.status} ${res.statusText}`) + '\n';
      // res.method
      // res.path
      ret += JSON.stringify(res.data, null, 2);
      return ret;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        // console.log(error.response.data);
        // console.log(error.response.status);
        // console.log(error.response.headers);
        let response = chalk.red(error.response.status);
        if (error.response.data.errors && error.response.data.errors.length === 1) {
          return response + ' ' + JSON.stringify(error.response.data.errors[0], null, 2);
        } else {
          return response + ' ' + JSON.stringify(error.response.data.errors, null, 2);
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request);
        return error.request;
      } else {
        // Something happened in setting up the request that triggered an Error
        // console.log('Error', error.message);
        return error.message;
      }
      // console.log(error.config);
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
  // G: [httpRequest('GET')] // alias,
  classicAddressToXAddress: [classicAddressToXAddress, 'Convert a classic address to an X-address'],
  sign: [sign, 'Sign <"secret"|"keypair"> {<object to sign>}'],
  prepareTransaction: [prepareTransaction, 'PrepareTransaction {<transaction object>}']
}

const t = terminal();
t.onRead = async (input: string) => {
  const parts = input.match(/\S+/g) || []; // Match non-whitespace
  const command = parts[0];
  if (isValidCommand(command)) {
    const spinner = ora('Loading').start();
    const cmdArray = commands[command] || commands[command.toUpperCase()];
    const method = cmdArray[0];
    let result;
    try {
      result = await (method as Function)(parts[1], parts.splice(2).join(' '));
    } catch (e) {
      console.log('Error: ' + e);
    }
    spinner.stop();
    console.log(result);
  } else {
    if (command) {
      console.log(`Invalid REPL keyword: ${command}`);
    }
  }
};
t.commands = commands;

function isValidCommand(command: string | number): command is keyof typeof commands {
  if (typeof command === 'string') {
    for (const element in commands) {
      if (command.trim().toLowerCase() === element.trim().toLowerCase()) {
        return true;
      }
    }
  }
  return false;
}

// Keeps service running after an exception
process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err);
});

// Logging for errors within promises
process.on('unhandledRejection', console.log);
