/**
* (WO-048) transistorAuthorizationToken is expanded here, in JavaScript:  neither native core knows the key.  These
* tests assert what ready() / reset() / setConfig() hand to cordova/exec when a config carries a token.
*
* The token's url must reach the native side as the compound http.url.  A flat `url` loses on Android whenever the
* caller also passes http.url (TSConfig lets a nested value beat its flat alias), so the token would not win there.
*
* No dependencies:  run with `npm test` (or `node test/transistor-token.test.js`).
*/
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var TOKEN_URL = 'http://10.0.2.2:9';
var LOCATIONS_URL = TOKEN_URL + '/api/locations';

function token() {
    return {url: TOKEN_URL, accessToken: 'lab-token', refreshToken: 'lab-refresh', expires: 4102444800};
}

/**
* Load www/BackgroundGeolocation.js with the real www/API.js and www/TransistorAuthorizationToken.js over a
* cordova/exec that records each call and answers it once.
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

// The one config the call handed to cordova/exec.
async function sent(execs, action, call) {
    await call;
    var calls = execs.filter(function(e) { return e.action === action; });
    assertEqual(calls.length, 1, 'one ' + action + ' exec');
    return calls[0].args[0];
}

// ---- the tests ---------------------------------------------------------------------------------------------

test('(WO-048) setConfig with an http group: the token url is sent as http.url, and the group keeps its keys',
async function(execs, BG) {
    var config = await sent(execs, 'setConfig', BG.setConfig({http: {autoSync: false}, transistorAuthorizationToken: token()}));
    assertEqual(config.http.url, LOCATIONS_URL, 'http.url');
    assertEqual(config.http.autoSync, false, 'http.autoSync');
    assertEqual('url' in config, false, 'no flat url');
    assertEqual('transistorAuthorizationToken' in config, false, 'the token key itself is not sent');
});

test("(WO-048) the token wins over a caller's http.url, and a flat url is not sent",
async function(execs, BG) {
    var config = await sent(execs, 'setConfig', BG.setConfig({
        http: {url: 'http://10.0.2.2:8/app', autoSync: false},
        url: 'http://10.0.2.2:8/flat',
        transistorAuthorizationToken: token()
    }));
    assertEqual(config.http.url, LOCATIONS_URL, 'http.url');
    assertEqual('url' in config, false, 'no flat url');
});

test('(WO-048) ready without an http group: the token creates one',
async function(execs, BG) {
    var config = await sent(execs, 'ready', BG.ready({transistorAuthorizationToken: token()}));
    assertEqual(config.http.url, LOCATIONS_URL, 'http.url');
    assertEqual('url' in config, false, 'no flat url');
});

test('(WO-048) reset(config) expands the token, and authorization comes from it',
async function(execs, BG) {
    var config = await sent(execs, 'reset', BG.reset({transistorAuthorizationToken: token()}));
    assertEqual(config.http.url, LOCATIONS_URL, 'http.url');
    assertEqual(config.authorization.accessToken, 'lab-token', 'authorization.accessToken');
    assertEqual(config.authorization.refreshToken, 'lab-refresh', 'authorization.refreshToken');
    assertEqual(config.authorization.refreshUrl, TOKEN_URL + '/api/refresh_token', 'authorization.refreshUrl');
    assertEqual(config.authorization.expires, 4102444800, 'authorization.expires');
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
