## Getting Started

### Requirements
  * [Node.js](https://nodejs.org/) (LTS version is fine)
  * [Python 2.7](https://www.python.org/downloads/) (NOT 3)

### Recommended
  * [git](https://git-scm.com/downloads)

### Directory Layout

```
.
├── /backend/                   # All scripts relating to gathering and saving our backend data
├── /node_modules/              # 3rd-party libraries and utilities
├── /hooks/                     # Scripts to support custom Cordova commands
├── /platforms/                 # Mobile platform support from Cordova
├── /plugins/                   # Configs for Cordova/Phonegap plugins
├── /www/                       # The source code of the application
│   ├── /build/                 # The folder for compiled output
│   ├── /css/                   # Css files
│   ├── /fonts/                 # Font files
│   ├── /img/                   # Image files
│   ├── /js/                    # JavaScript files
│   ├── /lib/                   # Libraries for the web browser
│   ├── /res/                   # Repository of Android/iPhone splash screens and icons
│   ├── /*.html                 # Each app page
├── /test/                      # Unit and end-to-end tests
├── config.xml                  # Configuration for iPhone/Android publishing
├── package.json                # The list of 3rd party libraries and utilities
└── webpack.config.babel.js     # Configuration for webpack (a JavaScript build tool)
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

#### 3. Run `npm run build` or `npm run build:dev`

This command will build the app from the source files (`/www`) into the output
`/www/build` folder. As soon as the initial build completes, you can open the app
by navigating to /www/index.html and open the file with a browser.

Running with `:dev` appended will build the app with no plugins (faster build times
and no minified code).

### How to Test

To launch unit tests:

```shell
$ npm run test          # Run unit tests with Mocha
```

Note: no tests currently exist.

### How to Update

If you need to keep your project up to date with the recent changes made,
you can always fetch and merge them from [this repo](https://github.com/AstroBoogie/DataScience)
back into your own project by running:

```shell
$ git pull
```

### How to emulate with Phonegap on iOS

#### 1. Install [Xcode](https://developer.apple.com/xcode/)

#### 2. Install Phonegap by running:

```shell
$ npm install -g phonegap@latest
```

#### 3. Run Phonegap iOS emulator in Xcode

```shell
$ phonegap run ios
```
