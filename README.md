# XRP-REPL

XRP-REPL is run on the command line and provides utility and convenience functions for the XRP Ledger.

It is similar to a command line interface.

### Requirements

- [Node v10 or higher](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/en/)
- An XRP Ledger account with XRP
    For development, you can use the XRP Test Net and get some test XRP from the [XRP Test Net Faucet](https://developers.ripple.com/xrp-test-net-faucet.html).

### Initial setup

1. Clone this repository (or download and extract a copy).

2. Install dependencies using Yarn.

        yarn

3. Start the REPL.

        yarn start

### Development

To start the server in development mode:

        yarn dev

This uses `nodemon` to automatically rebuild and restart the REPL when you save changes to the `.ts` source files. See `nodemon.json` for this project's nodemon configuration.
