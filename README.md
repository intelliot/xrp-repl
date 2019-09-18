# XRP-REPL

XRP-REPL is run on the command line and provides utility and convenience functions for the XRP Ledger.

It is similar to a command line interface.

### Requirements

- [Node v10 or higher](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/en/)
- An XRP Ledger account with XRP
    - For development, you can use the XRP Test Net and get some test XRP from the [XRP Test Net Faucet](https://developers.ripple.com/xrp-test-net-faucet.html).

### Initial setup

1. Clone this repository (or download and extract a copy).

2. Install dependencies using Yarn.

        yarn

3. Start the REPL.

        yarn start --base-url=http://localhost:3000/v1 --authorization='Bearer <apiKey>'

Replace `http://localhost:3000/v1` with your desired base url for HTTP requests. `--authorization` is optional; use the `apiKey` set in your `xrp-api` server configuration.

### Development

To start the server in development mode:

        yarn dev --base-url=http://localhost:3000/v1 --authorization='Bearer <apiKey>'

This uses `nodemon` to automatically rebuild and restart the REPL when you save changes to the `.ts` source files. See [`nodemon.json`](./nodemon.json) for this project's nodemon configuration.

## Usage

Replace values in `<brackets>`.

### Get account balance

    GET /accounts/<address>/info

### Send payment

    POST /payments {payment: {source_address: '<address>', source_tag: <tag>, source_amount: {value: '<value>', currency: '<currency>'}, destination_address: '<address>', destination_tag: <tag>, destination_amount: {value: '<value>', currency: '<currency>'}}, submit: <boolean>}

`<tag>`s are optional. If provided, each `<tag>` must be a 32-bit unsigned integer.

#### Example

    POST /payments {payment: {source_address: 'rLRnD5g6eb3TWrvfHoZ8y2mRznuu7GJzeN', source_tag: 123, source_amount: {value: '1000000', currency: 'drops'}, destination_address: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe', destination_tag: 456, destination_amount: {value: '1000000', currency: 'drops'}}, submit: true}
