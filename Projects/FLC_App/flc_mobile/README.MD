## Getting Started

### Requirements
  * [Node.js](https://nodejs.org/)

### Directory Layout

```
.
├── /backend/                   # All scripts relating to gathering and saving our backend data
├── /node_modules/              # 3rd-party libraries and utilities
├── /hooks/                     # ??? Can you fill this in Nathaniel
├── /platforms/                 # ??? Can you fill this in Nathaniel
├── /plugins/                   # ??? Can you fill this in Nathaniel
├── /www/                       # The source code of the application
│   ├── /css/                   # Css files
│   ├── /fonts/                 # Font files
│   ├── /img/                   # Image files
│   ├── /js/                    # JavaScript files
│   ├── /lib/                   # Libraries for the web browser
│   ├── /res/                   # ??? Can you fill this in Nathaniel
│   ├── /config.js              # Global application settings
│   └── /server.js              # Server-side startup script
├── /test/                      # Unit and end-to-end tests
├── /tools/                     # Build automation scripts and utilities
└── config.xml                  # ??? Can you fill this in Nathaniel
└── package.json                # The list of 3rd party libraries and utilities
```

### Quick Start

#### 1. Get the latest version

You can start by cloning the latest version of the FLC app on your local machine.

```shell
$ git clone https://github.com/AstroBoogie/DataScience.git
```

#### 2. Run `npm install`

This will install both run-time project dependencies and developer tools listed
in [package.json](../package.json) file.

#### 3. Run `npm start`

This command will build the app from the source files (`/www`) into the output
`/build` folder. As soon as the initial build completes, it will start the
Node.js server (`node build/server.js`).

> [http://localhost:3000/](http://localhost:3000/) — Node.js server (`build/server.js`)<br>

Now you can open your web app in a browser by following the link.

### How to Test

To launch unit tests:

```shell
$ npm run test          # Run unit tests with Mocha
```
### How to Update

If you need to keep your project up to date with the recent changes made,
you can always fetch and merge them from [this repo](https://github.com/AstroBoogie/DataScience)
back into your own project by running:

```shell
$ git pull
```
