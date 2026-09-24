/**
* The enum objects (LogLevel, DesiredAccuracy, Event, ...) that src/index.d.ts declares from the types package.
*
* www/Enums.js is a COPY of the types package's runtime values (a Cordova js-module cannot require an npm
* package), so these tests fail when the two drift apart, and check that both routes an app reaches them by
* actually serve them:  window.BackgroundGeolocation (www/BackgroundGeolocation.js) and the npm entry point
* (src/index.js).
*
* Needs the plugin's dependencies installed (`npm install`):  it reads @transistorsoft/background-geolocation-types.
*/
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var Types = require('@transistorsoft/background-geolocation-types');
var Enums = require('../www/Enums');

// Every runtime value the types package exports is one of these enum objects.
var TYPE_ENUMS = Object.keys(Types).filter(function(name) { return name !== '__esModule'; });

/**
* Load www/BackgroundGeolocation.js as Cordova would, with its sibling js-modules stubbed out (none of them is
* called here) and www/Enums.js loaded for real.
*/
function loadPlugin() {
    var stubs = {'./API': {}, './DeviceSettings': {}, './Logger': {}, './TransistorAuthorizationToken': {}};
    function load(name) {
        if (stubs[name]) return stubs[name];
        var file = path.join(__dirname, '..', 'www', name.replace('./', '') + '.js');
        var sandbox = {module: {exports: {}}, console: console, require: load};
        sandbox.exports = sandbox.module.exports;
        vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, {filename: file});
        return sandbox.module.exports;
    }
    return load('./BackgroundGeolocation');
}

// The plugin runs in its own vm realm, so compare by value (deepStrictEqual also compares prototypes).
function plain(value) { return JSON.parse(JSON.stringify(value)); }

var tests = [];
function test(name, fn) { tests.push({name: name, fn: fn}); }

test('www/Enums.js carries exactly the enum objects the types package exports', function() {
    assert.deepStrictEqual(Object.keys(Enums).sort(), TYPE_ENUMS.slice().sort());
});

test('each enum object in www/Enums.js equals the types package\'s', function() {
    TYPE_ENUMS.forEach(function(name) {
        assert.deepStrictEqual(Enums[name], Types[name], name + ' has drifted from the types package');
    });
});

test('window.BackgroundGeolocation carries each enum object, eg: LogLevel.Verbose', function() {
    var BG = loadPlugin();
    TYPE_ENUMS.forEach(function(name) {
        assert.deepStrictEqual(plain(BG[name]), plain(Types[name]), 'BackgroundGeolocation.' + name);
    });
    assert.strictEqual(BG.LogLevel.Verbose, 5);
});

test('the pre-existing constants are still there, and agree with the enum objects', function() {
    var BG = loadPlugin();
    assert.strictEqual(BG.LOG_LEVEL_VERBOSE, BG.LogLevel.Verbose);
    assert.strictEqual(BG.DESIRED_ACCURACY_HIGH, BG.DesiredAccuracy.High);
    assert.strictEqual(BG.PERSIST_MODE_ALL, BG.PersistMode.All);
    assert.strictEqual(typeof BG.ready, 'function');
});

test('src/index.js serves the enum objects before Cordova has loaded its plugins', function() {
    delete global.window;
    var index = require('../src/index');
    TYPE_ENUMS.forEach(function(name) {
        assert.deepStrictEqual(index[name], Types[name], 'import { ' + name + ' }');
    });
    assert.strictEqual(index.default.LogLevel.Verbose, 5, 'the default export');
});

test('src/index.js still forwards everything else to window.BackgroundGeolocation', function() {
    var calls = 0;
    global.window = {BackgroundGeolocation: {ready: function() { calls++; return this; }}};
    try {
        var index = require('../src/index');
        assert.strictEqual(index.ready(), global.window.BackgroundGeolocation, 'bound to the plugin');
        assert.strictEqual(calls, 1);
        assert.strictEqual(index.getState, undefined);
    } finally {
        delete global.window;
    }
});

var failures = 0;
tests.forEach(function(t) {
    try {
        t.fn();
        console.log('  ok   ' + t.name);
    } catch (error) {
        failures++;
        console.log('  FAIL ' + t.name + '\n         ' + error.message.split('\n').join('\n         '));
    }
});
console.log('\n' + (tests.length - failures) + '/' + tests.length + ' passed');
process.exit(failures ? 1 : 0);
