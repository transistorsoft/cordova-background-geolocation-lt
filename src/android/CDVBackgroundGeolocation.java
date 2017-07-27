package com.transistorsoft.cordova.bggeo;

import com.transistorsoft.locationmanager.adapter.BackgroundGeolocation;
import com.transistorsoft.locationmanager.adapter.TSCallback;
import com.transistorsoft.locationmanager.location.TSLocationManager;
import com.transistorsoft.locationmanager.settings.Settings;
import com.transistorsoft.locationmanager.util.Sensors;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.zip.GZIPOutputStream;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.Manifest;

import android.content.pm.PackageManager;
import android.net.Uri;
import com.google.android.gms.common.GoogleApiAvailability;

import android.app.AlertDialog;
import android.content.DialogInterface;

import android.app.Activity;
import android.content.Intent;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

public class CDVBackgroundGeolocation extends CordovaPlugin {
    private static final String TAG = "TSLocationManager";
    public static final String ACCESS_COARSE_LOCATION = Manifest.permission.ACCESS_COARSE_LOCATION;
    public static final String ACCESS_FINE_LOCATION = Manifest.permission.ACCESS_FINE_LOCATION;
    private static final String[] LOCATION_PERMISSIONS = {ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION};

    public static final int REQUEST_ACTION_START = 1;
    public static final int REQUEST_ACTION_GET_CURRENT_POSITION = 2;
    public static final int REQUEST_ACTION_START_GEOFENCES = 3;
    public static final int REQUEST_ACTION_WATCH_POSITION = 4;
    public static final int REQUEST_ACTION_CONFIGURE = 5;

    /**
     * Timeout in millis for a getCurrentPosition request to give up.
     * TODO make configurable.
     */

    public static final String ACTION_FINISH            = "finish";
    public static final String ACTION_START_BACKGROUND_TASK = "startBackgroundTask";
    public static final String ACTION_ERROR             = "error";
    public static final String ACTION_CONFIGURE         = "configure";
    public static final String ACTION_SET_CONFIG        = "setConfig";
    public static final String ACTION_ADD_LISTENER      = "addListener";
    public static final String ACTION_ADD_MOTION_CHANGE_LISTENER    = "addMotionChangeListener";
    public static final String ACTION_ADD_LOCATION_LISTENER = "addLocationListener";
    public static final String ACTION_ADD_HEARTBEAT_LISTENER = "addHeartbeatListener";
    public static final String ACTION_ADD_ACTIVITY_CHANGE_LISTENER = "addActivityChangeListener";
    public static final String ACTION_ADD_PROVIDER_CHANGE_LISTENER = "addProviderChangeListener";
    public static final String ACTION_ADD_SCHEDULE_LISTENER = "addScheduleListener";
    public static final String ACTION_REMOVE_LISTENERS  = "removeListeners";

    public static final String ACTION_ON_GEOFENCE       = "onGeofence";
    public static final String ACTION_PLAY_SOUND        = "playSound";
    public static final String ACTION_ACTIVITY_RELOAD   = "activityReload";
    public static final String ACTION_GET_STATE         = "getState";
    public static final String ACTION_ADD_HTTP_LISTENER = "addHttpListener";
    public static final String ACTION_GET_LOG           = "getLog";
    public static final String ACTION_EMAIL_LOG         = "emailLog";
    public static final String ACTION_START_SCHEDULE    = "startSchedule";
    public static final String ACTION_STOP_SCHEDULE     = "stopSchedule";

    private List<TSCallback> locationAuthorizationCallbacks = new ArrayList<TSCallback>();
    private List<CallbackContext> watchPositionCallbacks = new ArrayList<CallbackContext>();

    @Override
    protected void pluginInitialize() {
        initializeLocationManager();
    }

    private void initializeLocationManager() {
        Activity activity   = cordova.getActivity();
        Intent launchIntent = activity.getIntent();
        if (launchIntent.hasExtra("forceReload")) {
            activity.moveTaskToBack(true);
        }
        getAdapter().on(BackgroundGeolocation.EVENT_PLAY_SERVICES_CONNECT_ERROR, (new TSCallback() {
            @Override
            public void success(Object o) {
                onPlayServicesConnectError((Integer)o);
            }
            @Override
            public void error(Object o) {

            }
        }));
    }

    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "$ " + action + "()");

        Boolean result      = false;

        if (BackgroundGeolocation.ACTION_START.equalsIgnoreCase(action)) {
            result      = true;
            start(callbackContext);
        } else if (ACTION_START_SCHEDULE.equalsIgnoreCase(action)) {
            result = true;
            startSchedule(callbackContext);
        } else if (ACTION_STOP_SCHEDULE.equalsIgnoreCase(action)) {
            result = true;
            stopSchedule(callbackContext);
        } else if (BackgroundGeolocation.ACTION_START_GEOFENCES.equalsIgnoreCase(action)) {
            result = true;
            startGeofences(callbackContext);
        } else if (BackgroundGeolocation.ACTION_STOP.equalsIgnoreCase(action)) {
            // No implementation to stop background-tasks with Android.  Just say "success"
            result      = true;
            stop(callbackContext);
        } else if (ACTION_START_BACKGROUND_TASK.equalsIgnoreCase(action)) {
            result = true;
            callbackContext.success(0);
        } else if (ACTION_FINISH.equalsIgnoreCase(action)) {
            result = true;
            callbackContext.success();
        } else if (ACTION_ERROR.equalsIgnoreCase(action)) {
            result = true;
            this.onError(data.getString(1));
            callbackContext.success();
        } else if (ACTION_CONFIGURE.equalsIgnoreCase(action)) {
            result = true;
            configure(data.getJSONObject(0), callbackContext);
        } else if (ACTION_REMOVE_LISTENERS.equalsIgnoreCase(action)) {
            result = true;
            removeListeners(callbackContext);
        } else if (ACTION_ADD_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addListener(data.getString(0), callbackContext);
        } else if (ACTION_ADD_LOCATION_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addLocationListener(callbackContext);
        } else if (BackgroundGeolocation.ACTION_CHANGE_PACE.equalsIgnoreCase(action)) {
            result = true;
            if (!Settings.getEnabled()) {
                Log.w(TAG, "- Cannot change pace while disabled");
                callbackContext.error("Cannot #changePace while disabled");
            } else {
                changePace(callbackContext, data);
            }
        } else if (BackgroundGeolocation.ACTION_SET_CONFIG.equalsIgnoreCase(action)) {
            result = true;
            setConfig( data.getJSONObject(0), callbackContext);
        } else if (ACTION_GET_STATE.equalsIgnoreCase(action)) {
            result = true;
            callbackContext.success(Settings.getState());
        } else if (ACTION_ADD_MOTION_CHANGE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            this.addMotionChangeListener(callbackContext);
        } else if (BackgroundGeolocation.ACTION_GET_LOCATIONS.equalsIgnoreCase(action)) {
            result = true;
            getLocations(callbackContext);
        } else if (BackgroundGeolocation.ACTION_SYNC.equalsIgnoreCase(action)) {
            result = true;
            sync(callbackContext);
        } else if (BackgroundGeolocation.ACTION_GET_ODOMETER.equalsIgnoreCase(action)) {
            result = true;
            getOdometer(callbackContext);
        } else if (BackgroundGeolocation.ACTION_SET_ODOMETER.equalsIgnoreCase(action)) {
            result = true;
            setOdometer((float) data.getDouble(0), callbackContext);
        } else if (BackgroundGeolocation.ACTION_ADD_GEOFENCE.equalsIgnoreCase(action)) {
            result = true;
            addGeofence(callbackContext, data.getJSONObject(0));
        } else if (BackgroundGeolocation.ACTION_ADD_GEOFENCES.equalsIgnoreCase(action)) {
            result = true;
            addGeofences(callbackContext, data.getJSONArray(0));
        } else if (BackgroundGeolocation.ACTION_REMOVE_GEOFENCE.equalsIgnoreCase(action)) {
            result = true;
            removeGeofence(data.getString(0), callbackContext);
        } else if (BackgroundGeolocation.ACTION_REMOVE_GEOFENCES.equalsIgnoreCase(action)) {
            result = true;
            removeGeofences(data.getJSONArray(0), callbackContext);
        } else if (BackgroundGeolocation.ACTION_ON_GEOFENCE.equalsIgnoreCase(action)) {
            result = true;
            addGeofenceListener(callbackContext);
        } else if (BackgroundGeolocation.ACTION_GET_GEOFENCES.equalsIgnoreCase(action)) {
            result = true;
            getGeofences(callbackContext);
        } else if (ACTION_PLAY_SOUND.equalsIgnoreCase(action)) {
            result = true;
            getAdapter().startTone(data.getInt(0));
            callbackContext.success();
        } else if (BackgroundGeolocation.ACTION_GET_CURRENT_POSITION.equalsIgnoreCase(action)) {
            result = true;
            getCurrentPosition(callbackContext, data.getJSONObject(0));
        } else if (BackgroundGeolocation.ACTION_WATCH_POSITION.equalsIgnoreCase(action)) {
            result = true;
            watchPosition(callbackContext, data.getJSONObject(0));
        } else if (BackgroundGeolocation.ACTION_STOP_WATCH_POSITION.equalsIgnoreCase(action)) {
            result = true;
            stopWatchPosition(callbackContext);
        } else if (BackgroundGeolocation.ACTION_BEGIN_BACKGROUND_TASK.equalsIgnoreCase(action)) {
            // Android doesn't do background-tasks.  This is an iOS thing.  Just return a number.
            result = true;
            callbackContext.success(1);
        } else if (BackgroundGeolocation.ACTION_DESTROY_LOCATIONS.equalsIgnoreCase(action)) {
            result = true;
            destroyLocations(callbackContext);
        } else if (ACTION_ADD_HTTP_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addHttpListener(callbackContext);
        } else if (ACTION_ADD_HEARTBEAT_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addHeartbeatListener(callbackContext);
        } else if (ACTION_ADD_ACTIVITY_CHANGE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addActivityChangeListener(callbackContext);
        } else if (ACTION_ADD_PROVIDER_CHANGE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addProviderChangeListener(callbackContext);
        } else if (ACTION_ADD_SCHEDULE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addScheduleListener(callbackContext);
        } else if (ACTION_GET_LOG.equalsIgnoreCase(action)) {
            result = true;
            getLog(callbackContext);
        } else if (ACTION_EMAIL_LOG.equalsIgnoreCase(action)) {
            result = true;
            emailLog(callbackContext, data.getString(0));
        } else if (BackgroundGeolocation.ACTION_INSERT_LOCATION.equalsIgnoreCase(action)) {
            result = true;
            insertLocation(data.getJSONObject(0), callbackContext);
        } else if (BackgroundGeolocation.ACTION_GET_COUNT.equalsIgnoreCase(action)) {
            result = true;
            getCount(callbackContext);
        } else if (BackgroundGeolocation.ACTION_DESTROY_LOG.equalsIgnoreCase(action)) {
            result = true;
            destroyLog(callbackContext);
        } else if (BackgroundGeolocation.ACTION_GET_SENSORS.equalsIgnoreCase(action)) {
            result = true;
            getSensors(callbackContext);
        }
        return result;
    }

    private void configure(final JSONObject config, final CallbackContext callbackContext) {
        final TSCallback callback = new TSCallback() {
            public void success(Object state) {
                callbackContext.success((JSONObject) state);
            }
            public void error(Object error) {
                callbackContext.error("Configure failed");
            }
        };
        if (hasPermission(ACCESS_COARSE_LOCATION) && hasPermission(ACCESS_FINE_LOCATION)) {
            getAdapter().configure(config, callback);
        } else {
            requestPermissions(REQUEST_ACTION_CONFIGURE, new TSCallback() {
                @Override
                public void success(Object o) {
                    getAdapter().configure(config, callback);
                }

                @Override
                public void error(Object o) {
                    getAdapter().configure(config, callback);
                }
            });
        }
    }

    private void start(final CallbackContext callbackContext) {
        final TSCallback callback = new TSCallback() {
            public void success(Object state) {
                callbackContext.success(Settings.getState());
            }
            public void error(Object error) {
                callbackContext.error((String) error);
            }
        };

        if (hasPermission(ACCESS_COARSE_LOCATION) && hasPermission(ACCESS_FINE_LOCATION)) {
            getAdapter().start(callback);
        } else {
            requestPermissions(REQUEST_ACTION_START, new TSCallback() {
                @Override
                public void success(Object o) {
                    getAdapter().start(callback);
                }

                @Override
                public void error(Object o) {
                    callbackContext.error((Integer) o);
                }
            });
        }
    }

    private void startSchedule(CallbackContext callbackContext) {
        if (getAdapter().startSchedule()) {
            callbackContext.success();
        } else {
            callbackContext.error("Failed to start schedule.  Did you configure a #schedule?");
        }
    }

    private void stopSchedule(CallbackContext callback) {
        getAdapter().stopSchedule();
        callback.success();
    }

    private class StartGeofencesCallback implements TSCallback {
        private CallbackContext mCallbackContext;
        public StartGeofencesCallback(CallbackContext callbackContext) {
            mCallbackContext = callbackContext;
        }
        @Override
        public void success(Object state) {
            mCallbackContext.success((JSONObject) state);
        }
        @Override
        public void error(Object error) {
            mCallbackContext.error((Integer) error);
        }
    }

    private void startGeofences(final CallbackContext callback) {
        if (hasPermission(ACCESS_COARSE_LOCATION) && hasPermission(ACCESS_FINE_LOCATION)) {
            getAdapter().startGeofences(new StartGeofencesCallback(callback));
        } else {
            requestPermissions(REQUEST_ACTION_START_GEOFENCES, new TSCallback() {
                @Override
                public void success(Object o) {
                    getAdapter().startGeofences(new StartGeofencesCallback(callback));
                }

                @Override
                public void error(Object o) {
                    callback.error((Integer) o);
                }
            });
        }
    }

    private void stop(CallbackContext callbackContext) {
        locationAuthorizationCallbacks.clear();
        getAdapter().stop(new StopCallback(callbackContext));
    }

    private class StopCallback implements TSCallback {
        private CallbackContext mCallbackContext;
        public StopCallback(CallbackContext callback) {
            mCallbackContext = callback;
        }
        @Override
        public void success(Object state) {
            mCallbackContext.success((JSONObject) state);
        }
        @Override
        public void error(Object error) {
            mCallbackContext.error((String) error);
        }
    }
    private void changePace(final CallbackContext callbackContext, JSONArray data) throws JSONException {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {
                callbackContext.success((JSONObject)result);
            }
            public void error(Object result) {
                callbackContext.error((Integer) result);
            }
        };
        getAdapter().changePace(data.getBoolean(0), callback);
    }

    private void getLocations(final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {
                try {
                    JSONObject params = new JSONObject();
                    params.put("locations", result);
                    params.put("taskId", 0);
                    callbackContext.success(params);
                } catch (JSONException e) {
                    callbackContext.error(e.getMessage());
                    e.printStackTrace();
                }
            }
            public void error(Object error) {
                callbackContext.error((String) error);
            }
        };
        getAdapter().getLocations(callback);
    }

    private void getCount(final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            @Override
            public void success(Object count) {
                callbackContext.success((Integer) count);
            }
            @Override
            public void error(Object error) {
                callbackContext.error((String) error);
            }
        };
        getAdapter().getCount(callback);
    }

    private void sync(final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {
                try {
                    JSONObject params = new JSONObject();
                    params.put("locations", result);
                    params.put("taskId", 0);
                    callbackContext.success(params);
                } catch (JSONException e) {
                    e.printStackTrace();
                    callbackContext.error(e.getMessage());
                }
            }
            public void error(Object error) {
                callbackContext.error((String)error);
            }
        };
        getAdapter().sync(callback);
    }

    private void getCurrentPosition(final CallbackContext callbackContext, final JSONObject options) {
        final TSCallback callback = new TSCallback() {
            public void success(Object location) {
                callbackContext.success((JSONObject)location);
            }
            public void error(Object error) {
                callbackContext.error((Integer) error);
            }
        };

        if (hasPermission(ACCESS_COARSE_LOCATION) && hasPermission(ACCESS_FINE_LOCATION)) {
            getAdapter().getCurrentPosition(options, callback);
        } else {
            requestPermissions(REQUEST_ACTION_GET_CURRENT_POSITION, new TSCallback() {
                @Override
                public void success(Object o) {
                    getAdapter().getCurrentPosition(options, callback);
                }
                @Override
                public void error(Object o) {
                    callbackContext.error((Integer) o);
                }
            });
        }
    }

    private void watchPosition(final CallbackContext callbackContext, final JSONObject options) {

        final TSCallback callback = new TSCallback() {
            public void success(Object location) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) location);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            public void error(Object error) {
                callbackContext.error((Integer) error);
            }
        };

        if (hasPermission(ACCESS_COARSE_LOCATION) && hasPermission(ACCESS_FINE_LOCATION)) {
            watchPositionCallbacks.add(callbackContext);
            getAdapter().watchPosition(options, callback);
        } else {
            requestPermissions(REQUEST_ACTION_WATCH_POSITION, new TSCallback() {
                @Override
                public void success(Object o) {
                    watchPositionCallbacks.add(callbackContext);
                    getAdapter().watchPosition(options, callback);
                }

                @Override
                public void error(Object o) {
                    callbackContext.error((Integer) o);
                }
            });
        }
    }

    private void stopWatchPosition(CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {}
            public void error(Object error) {}
        };
        getAdapter().stopWatchPosition(callback);

        JSONArray callbackIds = new JSONArray();
        Iterator<CallbackContext> iterator = watchPositionCallbacks.iterator();
        while (iterator.hasNext()) {
            CallbackContext cb = iterator.next();
            callbackIds.put(cb.getCallbackId());
            iterator.remove();
        }
        callbackContext.success(callbackIds);
    }

    private void addGeofence(final CallbackContext callbackContext, JSONObject config) {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {
                callbackContext.success((String)result);
            }
            public void error(Object error) {
                callbackContext.error((String)error);
            }
        };
        getAdapter().addGeofence(config, callback);
    }

    private void addGeofences(final CallbackContext callbackContext, JSONArray geofences) {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {
                callbackContext.success();
            }
            public void error(Object result) {
                callbackContext.error((String) result);
            }
        };
        getAdapter().addGeofences(geofences, callback);
    }

    private void getGeofences(final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {
                callbackContext.success((JSONArray) result);
            }
            public void error(Object result) {
                callbackContext.error((String) result);
            }
        };
        getAdapter().getGeofences(callback);
    }
    private void getOdometer(CallbackContext callbackContext) {
        PluginResult result = new PluginResult(PluginResult.Status.OK, getAdapter().getOdometer());
        callbackContext.sendPluginResult(result);
    }

    private void setOdometer(Float value, final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void success(Object result) {
                callbackContext.success((JSONObject) result);
            }
            public void error(Object result) {
                callbackContext.error((String) result);
            }
        };
        getAdapter().setOdometer(value, callback);
    }

    private class AddListenerCallback implements TSCallback {
        private CallbackContext mCallbackContext;
        public AddListenerCallback(CallbackContext callbackContext) {
            mCallbackContext = callbackContext;
        }
        @Override
        public void success(Object event) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) event);
            result.setKeepCallback(true);
            mCallbackContext.sendPluginResult(result);
        }
        @Override
        public void error(Object error) {
            PluginResult result = new PluginResult(PluginResult.Status.ERROR, (String) error);
            result.setKeepCallback(true);
            mCallbackContext.sendPluginResult(result);
        }
    }

    private void addListener(String event, CallbackContext callbackContext) {
        TSCallback tsCallback = new AddListenerCallback(callbackContext);
        if (!getAdapter().on(event, tsCallback)) {
            callbackContext.error("[CDVBackgroundGeolocation addListener] Unknown event " + event);
        }
    }

    private void removeListeners(CallbackContext callbackContext) {
        getAdapter().removeListeners();
        callbackContext.success();
    }

    private void addGeofenceListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_GEOFENCE, (new TSCallback() {
            @Override
            public void success(Object params) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) params);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object error) {
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, (String) error);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        }));
    }

    private void addHeartbeatListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_HEARTBEAT, (new TSCallback() {
            @Override
            public void success(Object params) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) params);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object error) {
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, (String) error);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        }));
    }

    private void addActivityChangeListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_ACTIVITYCHANGE, (new TSCallback() {
            @Override
            public void success(Object activity) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) activity);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object o) {
                Log.e(TAG, BackgroundGeolocation.EVENT_ACTIVITYCHANGE + " error: " + o);
            }
        }));
    }

    private void addProviderChangeListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_PROVIDERCHANGE, (new TSCallback() {
            @Override
            public void success(Object state) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) state);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object o) {
                Log.e(TAG,BackgroundGeolocation.EVENT_PROVIDERCHANGE + " error: " + o);
            }
        }));
    }
    private void addScheduleListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_SCHEDULE, (new TSCallback() {
            @Override
            public void success(Object params) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) params);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object o) {
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, (String) o);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        }));
    }

    private void addLocationListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_LOCATION, (new TSCallback() {
            @Override
            public void success(Object params) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) params);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object errorCode) {
                Log.e(TAG,BackgroundGeolocation.EVENT_LOCATION + " error: " + errorCode);
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, (Integer)errorCode);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        }));
    }

    private void addMotionChangeListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_MOTIONCHANGE, (new TSCallback() {
            @Override
            public void success(Object params) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) params);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object o) {
                Log.e(TAG,BackgroundGeolocation.EVENT_MOTIONCHANGE + " error: " + o);
                callbackContext.error(BackgroundGeolocation.EVENT_MOTIONCHANGE + ":" + (String) o);
            }
        }));
    }

    private void addHttpListener(final CallbackContext callbackContext) {
        getAdapter().on(BackgroundGeolocation.EVENT_HTTP, (new TSCallback() {
            @Override
            public void success(Object params) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (JSONObject) params);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void error(Object error) {
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, (JSONObject) error);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        }));
    }

    private void removeGeofence(String identifier, final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            @Override
            public void success(Object identifier) {
                callbackContext.success((String) identifier);
            }
            @Override
            public void error(Object error) {
                callbackContext.error((String) error);
            }
        };
        getAdapter().removeGeofence(identifier, callback);
    }

    private void removeGeofences(final JSONArray identifiers, final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            @Override
            public void success(Object result) {
                callbackContext.success();
            }

            @Override
            public void error(Object error) {
                callbackContext.error((String) error);
            }
        };
        getAdapter().removeGeofences(identifiers, callback);
    }

    private class InsertLocationCallback implements TSCallback {
        private CallbackContext callbackContext;
        public InsertLocationCallback(CallbackContext _callbackContext) {
            callbackContext = _callbackContext;
        }
        @Override
        public void success(Object uuid) {
            callbackContext.success((String) uuid);
        }
        public void error(Object error) {
            callbackContext.error((String)error);
        }
    }
    private void insertLocation(JSONObject params, CallbackContext callbackContext) {
        getAdapter().insertLocation(params, new InsertLocationCallback(callbackContext));
    }

    private void setConfig(final JSONObject config, final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            @Override
            public void success(Object o) {
                callbackContext.success(Settings.getState());
            }

            @Override
            public void error(Object o) {
                callbackContext.error((String) o);
            }
        };
        getAdapter().setConfig(config, callback);
    }

    private void destroyLocations(final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void success(Object success) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, (Boolean) success);
                callbackContext.sendPluginResult(result);
            }
            public void error(Object error) {
                callbackContext.error((String) error);
            }
        };
        getAdapter().destroyLocations(callback);
    }

    private void getLog(CallbackContext callbackContext) {
        getAdapter().getLog(new GetLogCallback(callbackContext));
    }
    private class GetLogCallback implements TSCallback {
        private CallbackContext callbackContext;
        public GetLogCallback(CallbackContext _callbackContext) {
            callbackContext = _callbackContext;
        }
        @Override
        public void success(Object log) {
            callbackContext.success((String) log);
        }
        public void error(Object error) {
            callbackContext.error((String)error);
        }
    }

    private void destroyLog(CallbackContext callbackContext) {
        getAdapter().destroyLog(new DestroyLogCallback(callbackContext));
    }
    private class DestroyLogCallback implements TSCallback {
        private CallbackContext callbackContext;
        public DestroyLogCallback(CallbackContext _callbackContext) {
            callbackContext = _callbackContext;
        }
        @Override
        public void success(Object success) {
            callbackContext.success((String) success);
        }
        public void error(Object error) {
            callbackContext.error((String)error);
        }
    }

    private class EmailLogCallback implements TSCallback {
        private CallbackContext callbackContext;
        private String email;
        public EmailLogCallback(CallbackContext _callbackContext, String _email) {
            callbackContext = _callbackContext;
            email = _email;
        }
        @Override
        public void success(Object result) {
            String log = (String) result;

            Intent mailer = new Intent(Intent.ACTION_SEND);
            mailer.setType("message/rfc822");
            mailer.putExtra(Intent.EXTRA_EMAIL, new String[]{email});
            mailer.putExtra(Intent.EXTRA_SUBJECT, "BackgroundGeolocation log");

            try {
                JSONObject state = getState();
                mailer.putExtra(Intent.EXTRA_TEXT, state.toString(4));
            } catch (JSONException e) {
                Log.w(TAG, "- Failed to write state to email body");
                e.printStackTrace();
            }
            File file = new File(Environment.getExternalStorageDirectory(), "background-geolocation.log.gz");
            try {
                FileOutputStream stream = new FileOutputStream(file);
                try {
                    // Compresss log
                    ByteArrayOutputStream os = new ByteArrayOutputStream(log.length());
                    GZIPOutputStream gos = new GZIPOutputStream(os);
                    gos.write(log.getBytes());
                    gos.close();
                    byte[] compressed = os.toByteArray();
                    os.close();

                    stream.write(compressed);
                    stream.close();
                    mailer.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(file));
                    file.deleteOnExit();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            } catch (FileNotFoundException e) {
                Log.i(TAG, "FileNotFound");
                e.printStackTrace();
            }

            try {
                cordova.getActivity().startActivityForResult(Intent.createChooser(mailer, "Send log: " + email + "..."), 1);
                callbackContext.success();
            } catch (android.content.ActivityNotFoundException ex) {
                Toast.makeText(cordova.getActivity(), "There are no email clients installed.", Toast.LENGTH_SHORT).show();
                callbackContext.error("There are no email clients installed");
            }
        }
        public void error(Object error) {
            callbackContext.error((String)error);
        }
    }

    private void emailLog(final CallbackContext callback, final String email) {
        getAdapter().getLog(new EmailLogCallback(callback, email));
    }

    public void onPause(boolean multitasking) {
        Log.i(TAG, "- onPause");
    }
    public void onResume(boolean multitasking) {
        Log.i(TAG, "- onResume");
    }

    private JSONObject getState() {
        return Settings.getState();
    }

    private void getSensors(CallbackContext callbackContext) {
        JSONObject result = new JSONObject();
        Sensors sensors = Sensors.getInstance(cordova.getActivity().getApplicationContext());
        try {
            result.put("platform", "android");
            result.put("accelerometer", sensors.hasAccelerometer());
            result.put("magnetometer", sensors.hasMagnetometer());
            result.put("gyroscope", sensors.hasGyroscope());
            result.put("significant_motion", sensors.hasSignificantMotion());
            callbackContext.success(result);
        } catch (JSONException e) {
            callbackContext.error(e.getMessage());
            e.printStackTrace();
        }
    }

    private void onError(String error) {
        String message = "BG Geolocation caught a Javascript exception while running in background-thread:\n".concat(error);
        Log.e(TAG,message);

        // Show alert popup with js error
        if (Settings.getDebug()) {
            getAdapter().startTone(BackgroundGeolocation.TONE_ERROR);
            AlertDialog.Builder builder = new AlertDialog.Builder(this.cordova.getActivity());
            builder.setMessage(message)
                    .setCancelable(false)
                    .setNegativeButton("OK", new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            //do things
                        }
                    });
            AlertDialog alert = builder.create();
            alert.show();
        }
    }

    private boolean hasPermission(String action) {
        try {
            Method methodToFind = cordova.getClass().getMethod("hasPermission", String.class);
            if (methodToFind != null) {
                try {
                    return (Boolean) methodToFind.invoke(cordova, action);
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
            }
        } catch(NoSuchMethodException e) {
            // Probably SDK < 23 (MARSHMALLOW implmements fine-grained, user-controlled permissions).
            return true;
        }
        return true;
    }

    private void requestPermissions(int requestCode, TSCallback callback) {
        try {
            Method methodToFind = cordova.getClass().getMethod("requestPermissions", CordovaPlugin.class, int.class, String[].class);
            if (methodToFind != null) {
                try {
                    methodToFind.invoke(cordova, this, requestCode, LOCATION_PERMISSIONS);
                    locationAuthorizationCallbacks.add(callback);
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    e.printStackTrace();
                }
            }
        } catch(NoSuchMethodException e) {
            e.printStackTrace();
        }
    }

    public void onRequestPermissionResult(int requestCode, String[] permissions, int[] grantResults) throws JSONException {
        if (grantResults.length == 0) {
            Log.w(TAG, "Waiting for location permission result");
            return;
        }

        int result = grantResults[0];
        for (TSCallback callback : locationAuthorizationCallbacks) {
            if(result == PackageManager.PERMISSION_DENIED) {
                callback.error(TSLocationManager.LOCATION_ERROR_DENIED);
            } else {
                callback.success(requestCode);
            }
        }
        locationAuthorizationCallbacks.clear();
    }

    private void onPlayServicesConnectError(Integer errorCode) {
        Activity activity = cordova.getActivity();
        GoogleApiAvailability.getInstance().getErrorDialog(activity, errorCode, 1001).show();
    }

    private BackgroundGeolocation getAdapter() {
        Activity activity = cordova.getActivity();
        return BackgroundGeolocation.getInstance(activity.getApplicationContext(), activity.getIntent());
    }
    /**
     * Override method in CordovaPlugin.
     * Checks to see if it should turn off
     */
    public void onDestroy() {
        Log.i(TAG, "CDVBackgroundGeolocation#onDestoy");
        getAdapter().onActivityDestroy();
        super.onDestroy();
    }
}
