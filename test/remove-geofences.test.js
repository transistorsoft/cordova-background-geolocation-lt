/**
* (WO-055) What removeGeofences() hands to cordova/exec.
*
* "Remove all" is the absence of a list: an omitted argument, `null` and the callback form all cross as `null`, and
* the native plugins send that to the core's remove-all entry.  An empty list crosses as `[]`, which removes none.
* Through 5.5.0 an omitted argument was sent as `[]`, and `[]` removed every geofence.
*
* Anything else that is not a list rejects before exec.  exec sends JSON on both platforms, where NaN and Infinity
* become null: they would be read as "remove all".
*
* No dependencies:  run with `npm test` (or `node test/remove-geofences.test.js`).
*/
var fs = require('fs');
var path = require('path');
var vm = require('vm');

/**
* Load www/BackgroundGeolocation.js with the real www/API.js over a cordova/exec that records each call and
* answers it once, as test/transistor-token.test.js does.
*/
function loadPlugin(execs) {
    var stubs = {'./DeviceSettings': {}, './Logger': {}};
    var loaded = {};
    var exec = function(success, fail, service, action, args) {
        execs.push({action: action, args: args});
        if (success) Promise.resolve().then(success);
    };

    function load(name) {
        if (stubs[name]) return stubs[name];
        if (name === 'cordova/exec') return exec;
        if (loaded[name]) return loaded[name];

        var file = path.join(__dirname, '..', 'www', name.replace('./', '') + '.js');
        if (!fs.existsSync(file)) throw new Error('unexpected require: ' + name);
        var sandbox = {module: {exports: {}}, console: console, window: {cordova: {callbacks: {}}}, require: load};
        sandbox.exports = sandbox.module.exports;
        vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, {filename: file});
        loaded[name] = sandbox.module.exports;
        return loaded[name];
    }

    return load('./BackgroundGeolocation');
}

// ---- tiny test harness -------------------------------------------------------------------------------------

var tests = [];
function test(name, fn) { tests.push({name: name, fn: fn}); }

function assertEqual(actual, expected, message) {
    if (actual !== expected) throw new Error(message + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
}

// The arguments of the one removeGeofences exec, as JSON: what the native side is handed.
function sent(execs) {
    var calls = execs.filter(function(e) { return e.action === 'removeGeofences'; });
    assertEqual(calls.length, 1, 'one removeGeofences exec');
    return JSON.stringify(calls[0].args);
}

// ---- the tests ---------------------------------------------------------------------------------------------

test('(WO-055) removeGeofences() sends null: remove all', async function(execs, BG) {
    assertEqual(await BG.removeGeofences(), true, 'resolves');
    assertEqual(sent(execs), '[null]', 'exec args');
});

test('(WO-055) removeGeofences(undefined) and removeGeofences(null) send null: remove all', async function(execs, BG) {
    await BG.removeGeofences(undefined);
    assertEqual(sent(execs), '[null]', 'undefined');
    execs.length = 0;
    await BG.removeGeofences(null);
    assertEqual(sent(execs), '[null]', 'null');
});

test('(WO-055) removeGeofences([]) sends the empty list: remove none', async function(execs, BG) {
    assertEqual(await BG.removeGeofences([]), true, 'resolves');
    assertEqual(sent(execs), '[[]]', 'exec args');
});

test('(WO-055) removeGeofences([ids]) sends the list unchanged', async function(execs, BG) {
    await BG.removeGeofences(['home', 'work']);
    assertEqual(sent(execs), '[["home","work"]]', 'exec args');
});

test('(WO-055) the callback form removeGeofences(success, failure) sends null and calls success', async function(execs, BG) {
    var answered = new Promise(function(resolve, reject) { BG.removeGeofences(resolve, reject); });
    assertEqual(await answered, true, 'success(true)');
    assertEqual(sent(execs), '[null]', 'exec args');
});

test('(WO-055) the callback form removeGeofences([ids], success, failure) sends the list', async function(execs, BG) {
    var answered = new Promise(function(resolve, reject) { BG.removeGeofences(['home'], resolve, reject); });
    await answered;
    assertEqual(sent(execs), '[["home"]]', 'exec args');
});

function removeExecs(execs) {
    return execs.filter(function(e) { return e.action === 'removeGeofences'; }).length;
}

[
    ['NaN', NaN], ['Infinity', Infinity], ['a Symbol', Symbol('home')],
    ['a string', 'home'], ['an empty string', ''], ['a number', 42], ['zero', 0], ['false', false], ['an object', {identifier: 'home'}]
].forEach(function(item) {
    test('(WO-055) removeGeofences(' + item[0] + ') rejects without calling exec', async function(execs, BG) {
        var rejection = null;
        try { await BG.removeGeofences(item[1]); } catch (error) { rejection = error; }
        assertEqual(removeExecs(execs), 0, 'removeGeofences execs');
        assertEqual(typeof rejection, 'string', 'rejects with a message');
    });
});

test('(WO-055) the callback form with a first argument that is not a list calls failure', async function(execs, BG) {
    var answered = new Promise(function(resolve) {
        BG.removeGeofences(NaN, function() { resolve('success'); }, function(error) { resolve('failure'); });
    });
    assertEqual(await answered, 'failure', 'answered');
    assertEqual(removeExecs(execs), 0, 'removeGeofences execs');
});

// ---- run ---------------------------------------------------------------------------------------------------

(async function() {
    var failures = 0;
    for (var n = 0; n < tests.length; n++) {
        var execs = [];
        try {
            await tests[n].fn(execs, loadPlugin(execs));
            console.log('  ok   ' + tests[n].name);
        } catch (error) {
            failures++;
            console.log('  FAIL ' + tests[n].name + '\n         ' + error.message);
        }
    }
    console.log('\n' + (tests.length - failures) + '/' + tests.length + ' passed');
    process.exit(failures ? 1 : 0);
})();
