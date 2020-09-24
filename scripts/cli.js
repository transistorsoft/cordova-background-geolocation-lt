#!/usr/bin/env node

const fs = require("fs");
const path = require('path');

var args = process.argv.slice(2);
const cmd = args.shift();

const YELLOW = '\x1b[33m%s\x1b[0m';
const GREEN = '\x1b[32m';
const COLOR_RESET = "\x1b[0m";

const MODULE_NAME = "cordova-background-geolocation";

console.log(GREEN, "+---------------------------------------------------------");
console.log(GREEN, "| [cordova-background-geolocation] cmd:", cmd);
console.log(GREEN, "+---------------------------------------------------------", COLOR_RESET);

const ACTIONS = {
	mirror: 'mirror'
};

// Launch Command interpretor
const CLI = (function() {
	return {
		init: function() {
			switch(cmd) {
				case ACTIONS.mirror:
				  mirror();
				  break;
			}
		}
	}
})().init();

function mirror() {
	const SRC_PATH = path.join('..', MODULE_NAME);
	console.log('- Mirroring ', SRC_PATH);
	var mirrorPaths = [
		'src',
		'www'
	];


	var items = fs.readdirSync(SRC_PATH);
    console.log(items);

    for (var i=0; i<items.length; i++) {
        console.log(items[i]);
    }

}