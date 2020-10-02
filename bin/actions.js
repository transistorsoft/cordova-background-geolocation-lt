const fs = require('fs-extra')
const path = require('path');
const rimraf = require("rimraf");
const chalk = require('chalk');

const {
  exec,
  spawn,
  CLIError
} = require('./lib');

var args = process.argv.slice(2);
const cmd = args.shift();

const PRIVATE_MODULE_NAME = "cordova-background-geolocation";
const PUBLIC_MODULE_NAME = "cordova-background-geolocation-lt";

const COMMAND_MIRROR = 'mirror';
const COMMAND_TYPEDOC = 'typedoc';
const COMMAND_CP_DECLARATIONS = "cp-declarations"
const COMMAND_PUBLISH = 'publish';
const COMMAND_BUILD = 'build';

const IS_PRIVATE_REPO = process.cwd().split('/').pop() === PRIVATE_MODULE_NAME;

const MENU = {};

function registerCommand(name, description, handler) {
  MENU[name] = {
    description: description,
    handler: handler
  };
}



/// ACTION: mirror
///
if (!IS_PRIVATE_REPO) {
  registerCommand(COMMAND_MIRROR, 'Mirror private repo into the public repo', function() {
    mirror();
  });
}

/// ACTION: cp-declarations
///
registerCommand(COMMAND_CP_DECLARATIONS, 'Copy the Typescript declarations from another project', function(args) {
  if (args.length < 1) {
    throw new CLIError('A src-path argument is required, eg: cp-declarations /path/to/other');
  }
  return cpDeclarations(args);
});


/// ACTION: typedoc
///
registerCommand(COMMAND_TYPEDOC, 'Generate the typescript docs', function() {
   typedoc();
});


/// ACTION: publish
///
registerCommand(COMMAND_PUBLISH, 'Prepare repo for publishing', function() {
  publish();
});

/// ACTION: build
///
registerCommand(COMMAND_BUILD, 'Build Typescript', function() {
  build();
});


/// @private mirror implementation
///
async function mirror() {
	const SRC_PATH = path.join('..', PRIVATE_MODULE_NAME);
	console.log('- Mirroring ', SRC_PATH);
	var mirroredPaths = [
		'src',
		'www'
	];

	mirroredPaths.forEach(function(dir) {
    var src = path.join(SRC_PATH, dir);
    var dest = path.join('.', dir);
    console.log('- cp -R ', src, dest);
    fs.copySync(src, dest);
	});

  try {
    await cpDeclarations([SRC_PATH]);
    await typedoc();
    await build();
  } catch (error) {
    console.error('- Error: ', error);
    return -1;
  }
}


/// Copy Typescript declarations from another project
///
function cpDeclarations(args) {
  if (args.length < 1) {
    throw new CLIError('A src-path argument is required, eg: cp-declarations /path/to/other');
  }
  const srcPath = args.shift();

  const cmd = './scripts/cp-declarations ' + srcPath;

  return spawn(cmd);
}

/// Generate Typedoc docs
///
async function typedoc() {
  const cmd = './scripts/generate-docs';
  return spawn(cmd);
}


/// Build Typescript
///
async function build() {
  const cmd = 'tsc'
  const args = ['-p', path.join('.', 'src', 'ionic')];
  return spawn(cmd, args);
}


/// Prepare the repo for publishing
///
async function publish() {
  try {
    if (!IS_PRIVATE_REPO) {
      await mirror();
    } else {
      await typedoc();
      await build();
    }
  } catch (error) {
    console.error('- Error: ', error);
    return -1;
  }
}

module.exports = {
  actions: MENU
};


