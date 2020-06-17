#!/usr/bin/env node

// Node.js
import { debuglog } from 'util';
const debug = debuglog('on');

// 3rd party
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import jsonic from 'jsonic';
import JSON5 from 'json5';
import {argv} from 'yargs';

// 1st party
// import { RippleAPI } from 'ripple-lib';
// import * as cc from 'five-bells-condition';
import rippleBinaryCodec from 'ripple-binary-codec';

// Internal
import {terminal, Commands} from './io';

if (!argv['authorization']) {
  console.log('- `authorization` not specified.');
} else {
  axios.defaults.headers.common['Authorization'] = argv['authorization'];
}

if (!argv['base-url']) {
  console.log('- `base-url` not specified.');
  // console.log('          Defaulting to: --base-url=http://localhost:3000/v1');
}

const baseUrl = argv['base-url'] || 'http://localhost:3000/v1';

if (!process.env.npm_package_name) {
  const packageJson = require('../package.json');
  process.env.npm_package_name = packageJson.name;
  process.env.npm_package_version = packageJson.version;
}

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
  for (const command in commands) {
    if (commands[command].length >= 2) {
      help += `${command.padEnd(10)} ${commands[command][1]}\n`;
    }
  }

  help += '\n';
  help += `Press ^C to abort current expression, ^D to exit the repl`;
  return help;
};

const exit = () => {
  process.exit(0);
};

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
        const response = chalk.red(error.response.status);
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
  };
};

// Case insensitive
const commands: Commands = {
  '.help': [help, 'Print this help message'],
  '.exit': [exit, 'Exit the repl'],
  POST:    [httpRequest('POST'), 'Perform an HTTP POST request'],
  // P: [httpRequest('POST')], // alias
  GET:     [httpRequest('GET'), 'Perform an HTTP GET request'],
  // G: [httpRequest('GET')], // alias
  encode:  [rippleBinaryCodec.encode, 'Encode an object using ripple-binary-codec'],
  decode:  [rippleBinaryCodec.decode, 'Decode binary (hexadecimal) using ripple-binary-codec'],
};

let pendingCommand = '';
let readBuffer = '';
let numberOfClosingBracesRemaining = 0;

function handleMultilineCommand({input}: {input: string}) {
  readBuffer += input;

  const opening = (input.match(/{/g) || []).length;
  const closing = (input.match(/}/g) || []).length;
  numberOfClosingBracesRemaining = numberOfClosingBracesRemaining + opening - closing;

  if (numberOfClosingBracesRemaining === 0) {
    if (readBuffer.trim() === '') {
      console.log(`Ready for input`);
    } else {
      // Execute command
      let param: string | object;
      if (pendingCommand === 'encode') {
        param = JSON5.parse(readBuffer);
      } else {
        param = readBuffer;
      }
      const method = commands[pendingCommand][0];
      const result = (method as Function)(param);
      console.log(result);

      pendingCommand = '';
      numberOfClosingBracesRemaining = 0;
      readBuffer = '';
    }
  } else if (numberOfClosingBracesRemaining < 0) {
    console.log(`Invalid: Too many closing braces`);
  }
}

const t = terminal();
t.onRead = async (input: string) => {
  if (pendingCommand) {
    handleMultilineCommand({input});
    return;
  }

  const parts = input.match(/\S+/g) || []; // Match non-whitespace
  const command = parts[0];

  // Special case multi-line commands
  if (command === 'encode' || command === 'decode') {
    pendingCommand = command;
    handleMultilineCommand({input: parts.slice(1).join(' ')});
    return;
  }

  if (isValidCommand(command)) {
    const spinner = ora('Loading').start();
    const cmdArray = commands[command] || commands[command.toUpperCase()];
    const method = cmdArray[0];
    const result = await (method as Function)(parts[1], parts.splice(2).join(' '));
    spinner.stop();
    console.log(result);
  } else {
    console.log(`Invalid REPL keyword: ${command}`);
  }
};
t.commands = commands;

t.onInterrupt = () => {
  pendingCommand = '';
  numberOfClosingBracesRemaining = 0;
  readBuffer = '';
};

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
