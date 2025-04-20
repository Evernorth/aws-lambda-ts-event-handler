# Installation instructions

follow these steps to install and build the library.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (version >= 18)
- **npm** (Node Package Manager)

## Installation

1. Clone the repository:

   ```shell
   git clone https://github.com/Evernorth/aws-lambda-ts-event-handler.git
   cd aws-lambda-ts-event-handler

   ```

2. Install dependencies:
   ```shell
   npm install
   ```

## Build

To build the project, run:
`shell
    npm run build
    `
This will compile the TypeScript files into JavaScript and output them to the lib directory.

## Additional Scripts

- Watch for changes and rebuild automatically:

  ```shell
  npm run watch:build
  ```

- Run Tests
  ```shell
  npm test
  ```
