/**
* Unit tests for the event-listener registry in www/API.js:  which callbackId a subscription owns, and what
* remove() / removeListener() / removeListeners() send to the native side.
*
* No dependencies:  run with `npm test` (or `node test/registry.test.js`).
*
* window.cordova and cordova/exec are mocked after cordova-android's bridge, and the mock also keeps the set of
* listeners the NATIVE side would hold:  an add*Listener registers one, removeListener removes it only when the
* event-name matches (iOS looks its listener up by event-name), removeListeners clears them all.  A test that
* ends with a non-empty native set is a listener leak.
*/
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var ACTION_EVENTS = {
    addLocationListener: 'location',
    addMotionChangeListener: 'motionchange',
    addLocationFilterListener: 'locationfilter',
    addActivityChangeListener: 'activitychange',
    addProviderChangeListener: 'providerchange',
    addGeofenceListener: 'geofence',
    addGeofencesChangeListener: 'geofenceschange',
    addHttpListener: 'http',
    addPowerSaveChangeListener: 'powersavechange',
    addConnectivityChangeListener: 'connectivitychange',
    addEnabledChangeListener: 'enabledchange',
    addHeartbeatListener: 'heartbeat',
    addScheduleListener: 'schedule',
    addNotificationActionListener: 'notificationaction',
    addAuthorizationListener: 'authorization'
};

// Actions whose callback the native side KEEPS without being a listener registration:
// watchPosition delivers until stopWatchPosition, so the mock must not answer it once and
// release it the way it does a one-shot call (WO-034).
var KEEP_CALLBACK = {watchPosition: true};

// One-shot actions whose native side answers WITH a payload;  every other action answers with none.
var REPLY = {requestPermission: 3};     // AuthorizationStatus.Always (WO-052)

function createBridge() {
    var bridge = {
        callbacks: {},        // window.cordova.callbacks
        native: new Map(),    // callbackId -> event, the listeners the native side holds
        execs: [],            // {action, args, callbackId}
        counter: 0
    };

    bridge.exec = function(success, fail, service, action, args) {
        var callbackId = service + (bridge.counter++);
        bridge.callbacks[callbackId] = {success: success, fail: fail};
        bridge.execs.push({action: action, args: args, callbackId: callbackId});

        if (ACTION_EVENTS[action]) {
            // Listener registrations keep their callback (keepCallback) and register natively.
            bridge.native.set(callbackId, ACTION_EVENTS[action]);
            return callbackId;
        }
        if (KEEP_CALLBACK[action]) {
            return callbackId;          // retained; a test delivers with bridge.emit()
        }
        if (action === 'removeListener') {
            var event = args[0], target = args[1];
            if (bridge.native.get(target) === event) {
                bridge.native.delete(target);
            }
        } else if (action === 'removeListeners') {
            bridge.native.clear();
        }
        // Everything else answers once and releases its callback, as the bridge does for keepCallback: false.
        delete bridge.callbacks[callbackId];
        if (success) Promise.resolve().then(function() { success(REPLY[action]); });
        return callbackId;
    };

    // Deliver an event to whatever JS callback still owns callbackId.
    bridge.emit = function(callbackId, payload) {
        var callback = bridge.callbacks[callbackId];
        if (callback && callback.success) callback.success(payload);
    };

    bridge.execsOf = function(action) {
        return bridge.execs.filter(function(e) { return e.action === action; });
    };

    return bridge;
}

/**
* Load the plugin's www JavaScript over the mocked bridge and return its public interface
* (www/BackgroundGeolocation.js, whose event methods funnel into www/API.js#addListener).
*/
function loadPlugin(bridge) {
    var stubs = {
        './TransistorAuthorizationToken': {applyIf: function(config) { return config; }},
        './DeviceSettings': {},
        './Logger': {}
    };
    var loaded = {};

    function load(name) {
        if (stubs[name]) return stubs[name];
        if (name === 'cordova/exec') return bridge.exec;
        if (loaded[name]) return loaded[name];

        var file = path.join(__dirname, '..', 'www', name.replace('./', '') + '.js');
        if (!fs.existsSync(file)) throw new Error('unexpected require: ' + name);
        var sandbox = {
            module: {exports: {}},
            console: console,
            setTimeout: setTimeout,
            window: {cordova: {callbacks: bridge.callbacks}},
            require: load
        };
        sandbox.exports = sandbox.module.exports;
        vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, {filename: file});
        loaded[name] = sandbox.module.exports;
        return loaded[name];
    }

    return load('./BackgroundGeolocation');
}

// ---- tiny test harness -------------------------------------------------------------------------------------

var failures = [];
var tests = [];
function test(name, fn) { tests.push({name: name, fn: fn}); }

function assert(condition, message) {
    if (!condition) throw new Error(message);
}
function assertEqual(actual, expected, message) {
    if (actual !== expected) throw new Error(message + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
}
// The plugin runs in its own vm realm, so `instanceof Error` is false even for a real Error —
// check the shape, and that it is not the bare string this code used to throw (WO-034).
function assertIsError(value, message) {
    assert(value !== null && typeof value === 'object' && typeof value.message === 'string'
           && value.name === 'Error', message + ' (got ' + typeof value + ': ' + value + ')');
}

function assertNoNativeLeak(bridge) {
    assertEqual(bridge.native.size, 0, 'native listeners left registered (' + JSON.stringify([...bridge.native]) + ')');
}

// The mock answers in microtasks, so a few turns let a callback-form call be answered, or show it never will be.
// Not setTimeout:  yielding to the event loop reports the rejection stopWatchPosition's payload-less answer leaves.
async function settle() {
    for (var n = 0; n < 10; n++) await Promise.resolve();
}
function assertIsPromise(value, message) {
    assert(value !== null && typeof value === 'object' && typeof value.then === 'function',
           message + ' (got ' + typeof value + ')');
}

// ---- the tests ---------------------------------------------------------------------------------------------

// ---------------------------------------------------------------- watchPosition (WO-034)
test('(WO-034) watchPosition takes its options FIRST and wires the location callback',
async function(bridge, BG) {
    var seen = [];
    var subscription = BG.watchPosition({interval: 1000, persist: false}, function(location) {
        seen.push(location);
    });
    var execs = bridge.execsOf('watchPosition');
    assertEqual(execs.length, 1, 'one watchPosition exec');
    assertEqual(execs[0].args[0].interval, 1000, 'the options cross the wire, as args[0]');
    assertEqual(execs[0].args[0].persist, false, 'every option, not just the first');
    assert(subscription && typeof subscription.remove === 'function',
           'watchPosition returns a Subscription, as the types declare');
    // The watch delivers many times; one delivery is enough to prove the callback is the one the
    // CALLER passed (the timestamp's own shape is WO-029's question, not asserted here).
    bridge.emit(execs[0].callbackId, {uuid: 'u1', timestamp: '2026-09-22T20:00:00.000Z'});
    assertEqual(seen.length, 1, 'the location reached the callback the caller passed');
    assertEqual(seen[0].uuid, 'u1', 'and it is the location the native side sent');
});
test('(WO-034) the pre-6.0 argument order is refused, with a message that names the fix',
async function(bridge, BG) {
    var threw = null;
    try {
        BG.watchPosition(function() {}, function() {}, {interval: 1000});
    } catch (error) {
        threw = error;
    }
    assertIsError(threw, 'a real Error, not the thrown string this used to raise');
    assert(/options FIRST/.test(threw.message), 'the message names the new order: ' + (threw && threw.message));
    assertEqual(bridge.execsOf('watchPosition').length, 0, 'nothing reached the native side');
});
test('(WO-034) watchPosition without a location callback is refused, not silently started',
async function(bridge, BG) {
    var threw = null;
    try {
        BG.watchPosition({interval: 1000});
    } catch (error) {
        threw = error;
    }
    assertIsError(threw, 'a real Error');
    assertEqual(bridge.execsOf('watchPosition').length, 0, 'nothing reached the native side');
});
test('(WO-034) the Subscription stops watching', async function(bridge, BG) {
    var subscription = BG.watchPosition({interval: 1000}, function() {});
    subscription.remove();
    assertEqual(bridge.execsOf('stopWatchPosition').length, 1,
                'remove() sends stopWatchPosition (which stops EVERY watch — see the work order)');
});

// ---------------------------------------------------------------- requestPermission (WO-052)
test('(WO-052) requestPermission(Permission.Motion) sends the permission and resolves its status',
async function(bridge, BG) {
    var result = BG.requestPermission(BG.Permission.Motion);
    assertIsPromise(result, 'returns the Promise the types declare');
    assertEqual(await result, 3, 'resolves the AuthorizationStatus the native side sent');
    var execs = bridge.execsOf('requestPermission');
    assertEqual(execs.length, 1, 'one requestPermission exec');
    assertEqual(JSON.stringify(execs[0].args), '["motion"]', 'the permission crosses the wire as args[0]');
});
test('(WO-052) requestPermission(undefined) and (null) are the Promise form, and request everything',
async function(bridge, BG) {
    var fromUndefined = BG.requestPermission(undefined);
    var fromNull = BG.requestPermission(null);
    assertIsPromise(fromUndefined, 'requestPermission(undefined) returns the Promise (permission?: Permission)');
    assertIsPromise(fromNull, 'requestPermission(null) returns the Promise');
    assertEqual(await fromUndefined, 3, 'and it resolves the status');
    assertEqual(await fromNull, 3, 'and it resolves the status');
    bridge.execsOf('requestPermission').forEach(function(exec) {
        assertEqual(JSON.stringify(exec.args), '[]', 'no permission crosses the wire:  [] = everything');
    });
});
test('(WO-052) requestPermission() is unchanged:  the Promise form, requesting everything',
async function(bridge, BG) {
    var result = BG.requestPermission();
    assertIsPromise(result, 'returns the Promise');
    assertEqual(await result, 3, 'resolves the status');
    assertEqual(JSON.stringify(bridge.execsOf('requestPermission')[0].args), '[]', 'execs []');
});
test('(WO-052) the legacy requestPermission(success, failure) form is unchanged',
async function(bridge, BG) {
    var seen = [];
    var returned = BG.requestPermission(function(status) { seen.push(status); },
                                        function(status) { seen.push('failure:' + status); });
    await settle();
    assertEqual(returned, undefined, 'the callback form returns nothing, as it always has');
    assertEqual(JSON.stringify(seen), '[3]', 'success received the status');
    assertEqual(JSON.stringify(bridge.execsOf('requestPermission')[0].args), '[]', 'execs []');
});
test('(WO-052) requestPermission(Permission.Location, success, failure) sends the permission and calls back',
async function(bridge, BG) {
    var seen = [];
    var returned = BG.requestPermission(BG.Permission.Location,
                                        function(status) { seen.push(status); },
                                        function(status) { seen.push('failure:' + status); });
    await settle();
    assertEqual(returned, undefined, 'the callback form returns nothing');
    assertEqual(JSON.stringify(seen), '[3]', 'success received the status');
    assertEqual(JSON.stringify(bridge.execsOf('requestPermission')[0].args), '["location"]',
                'the permission crosses the wire as args[0]');
});

test('remove() unregisters the subscription it came from', async function(bridge, BG) {
    var subscription = BG.onLocation(function() {});
    assertEqual(bridge.native.size, 1, 'one native listener after onLocation');
    subscription.remove();
    assertEqual(bridge.execsOf('removeListener').length, 1, 'one removeListener exec');
    assertEqual(bridge.execsOf('removeListener')[0].args[0], 'location', 'removeListener carries the event');
    assertNoNativeLeak(bridge);
});

test('remove() twice sends only one removeListener', async function(bridge, BG) {
    var subscription = BG.onHeartbeat(function() {});
    subscription.remove();
    subscription.remove();
    assertEqual(bridge.execsOf('removeListener').length, 1, 'removeListener exec count');
    assertNoNativeLeak(bridge);
});

test('the same handler added again after removeListeners() is still removable', async function(bridge, BG) {
    var handler = function() {};
    BG.onLocation(handler);
    await BG.removeListeners();
    var subscription = BG.onLocation(handler);
    assertEqual(bridge.native.size, 1, 'the new listener is registered');
    subscription.remove();
    assertEqual(bridge.execsOf('removeListener').length, 1, 'remove() reached native');
    assertNoNativeLeak(bridge);
});

test('a listener added after an un-awaited removeListeners() survives and stays removable', async function(bridge, BG) {
    var calls = 0;
    BG.onLocation(function() {});
    BG.removeListeners();                       // deliberately not awaited
    var subscription = BG.onLocation(function() { calls++; });
    var callbackId = bridge.execs[bridge.execs.length - 1].callbackId;
    await Promise.resolve();                    // let removeListeners' success callback run
    await Promise.resolve();

    bridge.emit(callbackId, {});
    assertEqual(calls, 1, 'the new handler receives events');
    assertEqual(bridge.native.size, 1, 'the new listener is registered natively');
    subscription.remove();
    assertNoNativeLeak(bridge);
});

test('one handler, two subscriptions to an unwrapped event: both are removable', async function(bridge, BG) {
    var handler = function() {};
    var first = BG.onHeartbeat(handler);
    var second = BG.onHeartbeat(handler);
    assertEqual(bridge.native.size, 2, 'two native listeners');
    first.remove();
    assertEqual(bridge.native.size, 1, 'first removed');
    second.remove();
    assertNoNativeLeak(bridge);
});

test('one handler, two subscriptions to a wrapped event: both are removable', async function(bridge, BG) {
    var handler = function() {};
    var first = BG.onLocation(handler);
    var second = BG.onLocation(handler);
    assertEqual(bridge.native.size, 2, 'two native listeners');
    first.remove();
    second.remove();
    assertNoNativeLeak(bridge);
});

test('an event name in the wrong case registers, and removes with the canonical name', async function(bridge, BG) {
    var handler = function() {};
    BG.on('Location', handler);
    assertEqual(bridge.native.size, 1, 'a non-canonical event name still registers');
    await BG.removeListener('Location', handler);
    assertEqual(bridge.execsOf('removeListener')[0].args[0], 'location', 'removal sends the canonical event');
    assertNoNativeLeak(bridge);
});

test('removeListener(event, handler) removes the registration of that event', async function(bridge, BG) {
    var handler = function() {};
    BG.onHttp(handler);
    BG.onHeartbeat(handler);
    await BG.removeListener('heartbeat', handler);
    assertEqual(bridge.native.size, 1, 'one listener left');
    assertEqual([...bridge.native.values()][0], 'http', 'the http listener is the one still registered');
});

test('subscriptions created before removeListeners() do not remove later ones', async function(bridge, BG) {
    var handler = function() {};
    var stale = BG.onHeartbeat(handler);
    await BG.removeListeners();
    var fresh = BG.onHeartbeat(handler);
    stale.remove();                             // its listener is long gone
    assertEqual(bridge.native.size, 1, 'the fresh listener survives a stale remove()');
    fresh.remove();
    assertNoNativeLeak(bridge);
});

// ---- run ---------------------------------------------------------------------------------------------------

(async function() {
    for (var n = 0; n < tests.length; n++) {
        var bridge = createBridge();
        try {
            await tests[n].fn(bridge, loadPlugin(bridge));
            console.log('  ok   ' + tests[n].name);
        } catch (error) {
            failures.push({name: tests[n].name, error: error});
            console.log('  FAIL ' + tests[n].name + '\n         ' + error.message);
        }
    }
    console.log('\n' + (tests.length - failures.length) + '/' + tests.length + ' passed');
    process.exit(failures.length ? 1 : 0);
})();
