package com.transistorsoft.cordova.bggeo;

import com.transistorsoft.locationmanager.adapter.BackgroundGeolocation;
import com.transistorsoft.locationmanager.adapter.callback.*;
import com.transistorsoft.locationmanager.data.LocationModel;
import com.transistorsoft.locationmanager.event.ActivityChangeEvent;
import com.transistorsoft.locationmanager.event.GeofenceEvent;
import com.transistorsoft.locationmanager.event.GeofencesChangeEvent;
import com.transistorsoft.locationmanager.event.HeartbeatEvent;
import com.transistorsoft.locationmanager.event.LocationProviderChangeEvent;
import com.transistorsoft.locationmanager.geofence.TSGeofence;
import com.transistorsoft.locationmanager.http.HttpResponse;
import com.transistorsoft.locationmanager.location.TSLocation;
import com.transistorsoft.locationmanager.logger.TSLog;
import com.transistorsoft.locationmanager.scheduler.ScheduleEvent;
import com.transistorsoft.locationmanager.settings.Settings;
import com.transistorsoft.locationmanager.util.Sensors;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.Manifest;

import android.content.pm.PackageManager;
import com.google.android.gms.common.GoogleApiAvailability;

import android.app.AlertDialog;
import android.content.DialogInterface;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

public class CDVBackgroundGeolocation extends CordovaPlugin {
    private static final String TAG = "TSLocationManager";
    private static final String HEADLESS_JOB_SERVICE_CLASS = "HeadlessJobService";

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
    public static final String ACTION_ADD_MOTION_CHANGE_LISTENER    = "addMotionChangeListener";
    public static final String ACTION_ADD_LOCATION_LISTENER = "addLocationListener";
    public static final String ACTION_ADD_HEARTBEAT_LISTENER = "addHeartbeatListener";
    public static final String ACTION_ADD_ACTIVITY_CHANGE_LISTENER = "addActivityChangeListener";
    public static final String ACTION_ADD_PROVIDER_CHANGE_LISTENER = "addProviderChangeListener";
    public static final String ACTION_ADD_SCHEDULE_LISTENER = "addScheduleListener";
    public static final String ACTION_REMOVE_LISTENERS  = "removeListeners";
    public static final String ACTION_ADD_GEOFENCE_LISTENER = "addGeofenceListener";
    public static final String ACTION_ADD_GEOFENCESCHANGE_LISTENER = "addGeofencesChangeListener";
    public static final String ACTION_ADD_POWERSAVECHANGE_LISTENER = "addPowerSaveChangeListener";

    public static final String ACTION_PLAY_SOUND        = "playSound";
    public static final String ACTION_GET_STATE         = "getState";
    public static final String ACTION_ADD_HTTP_LISTENER = "addHttpListener";
    public static final String ACTION_GET_LOG           = "getLog";
    public static final String ACTION_EMAIL_LOG         = "emailLog";
    public static final String ACTION_START_SCHEDULE    = "startSchedule";
    public static final String ACTION_STOP_SCHEDULE     = "stopSchedule";
    public static final String ACTION_LOG               = "log";

    private List<TSCallback> locationAuthorizationCallbacks = new ArrayList<TSCallback>();
    private List<CallbackContext> watchPositionCallbacks = new ArrayList<CallbackContext>();
    private List<CordovaCallback> cordovaCallbacks = new ArrayList<CordovaCallback>();

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
        getAdapter().onPlayServicesConnectError((new TSPlayServicesConnectErrorCallback() {
            @Override
            public void onPlayServicesConnectError(int errorCode) {
                handlePlayServicesConnectError(errorCode);
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
        } else if (BackgroundGeolocation.ACTION_REMOVE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            removeListener(data.getString(0), data.getString(1), callbackContext);
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
            callbackContext.success(getAdapter().getState());
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
        } else if (ACTION_ADD_GEOFENCE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addGeofenceListener(callbackContext);
        } else if (ACTION_ADD_GEOFENCESCHANGE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addGeofencesChangeListener(callbackContext);
        } else if (ACTION_ADD_POWERSAVECHANGE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addPowerSaveChangeListener(callbackContext);
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
            emailLog(data.getString(0), callbackContext);
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
        } else if (BackgroundGeolocation.ACTION_IS_POWER_SAVE_MODE.equalsIgnoreCase(action)) {
            result = true;
            isPowerSaveMode(callbackContext);
        } else if (ACTION_LOG.equalsIgnoreCase(action)) {
            result = true;
            log(data, callbackContext);
        }
        return result;
    }

    private void configure(final JSONObject config, final CallbackContext callbackContext) throws JSONException {
        TSCallback callback = new TSCallback() {
            public void onSuccess() {
                callbackContext.success(getAdapter().getState());
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        };
        if (config.has("enableHeadless") && config.getBoolean("enableHeadless")) {
            config.put("headlessJobService", getClass().getPackage().getName() + "." + HEADLESS_JOB_SERVICE_CLASS);
        }
        getAdapter().configure(config, callback);
    }

    private void start(final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void onSuccess() {
                callbackContext.success(getAdapter().getState());
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        };

        getAdapter().start(callback);
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
        public void onSuccess() {
            mCallbackContext.success(getAdapter().getState());
        }
        @Override
        public void onFailure(String error) {
            mCallbackContext.error(error);
        }
    }

    private void startGeofences(final CallbackContext callback) {
        getAdapter().startGeofences(new StartGeofencesCallback(callback));
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
        public void onSuccess() {
            mCallbackContext.success(getAdapter().getState());
        }
        @Override
        public void onFailure(String error) {
            mCallbackContext.error(error);
        }
    }

    private void changePace(final CallbackContext callbackContext, JSONArray data) throws JSONException {
        getAdapter().changePace(data.getBoolean(0), new TSCallback() {
            public void onSuccess() {
                callbackContext.success();
            }
            public void onFailure(String error) { callbackContext.error(error); }
        });
    }

    private void getLocations(final CallbackContext callbackContext) {
        getAdapter().getLocations(new TSGetLocationsCallback() {
            public void onSuccess(List<LocationModel> locations) {
                try {
                    JSONArray data = new JSONArray();
                    for (LocationModel location : locations) {
                        data.put(location.json);
                    }
                    JSONObject params = new JSONObject();
                    params.put("locations", data);
                    callbackContext.success(params);
                } catch (JSONException e) {
                    callbackContext.error(e.getMessage());
                    e.printStackTrace();
                }
            }
            public void onFailure(Integer error) {
                callbackContext.error(error);
            }
        });
    }

    private void getCount(final CallbackContext callbackContext) {
        getAdapter().getCount(new TSGetCountCallback() {
            @Override
            public void onSuccess(Integer count) {
                callbackContext.success(count);
            }
            @Override
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void sync(final CallbackContext callbackContext) {
        getAdapter().sync(new TSSyncCallback() {
            public void onSuccess(List<LocationModel> records) {
                try {
                    JSONArray data = new JSONArray();
                    for (LocationModel location : records) {
                        data.put(location.json);
                    }
                    JSONObject params = new JSONObject();
                    params.put("locations", data);
                    callbackContext.success(params);
                } catch (JSONException e) {
                    e.printStackTrace();
                    callbackContext.error(e.getMessage());
                }
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void getCurrentPosition(final CallbackContext callbackContext, final JSONObject options) {
        TSLocationCallback callback = new TSLocationCallback() {
            public void onLocation(TSLocation location) {
                callbackContext.success(location.toJson());
            }
            public void onError(Integer error) {
                callbackContext.error(error);
            }
        };
        getAdapter().getCurrentPosition(options, callback);
    }

    private void watchPosition(final CallbackContext callbackContext, final JSONObject options) {

        TSLocationCallback callback = new TSLocationCallback() {
            public void onLocation(TSLocation location) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, location.toJson());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            public void onError(Integer error) {
                callbackContext.error(error);
            }
        };
        watchPositionCallbacks.add(callbackContext);
        getAdapter().watchPosition(options, callback);
    }

    private void stopWatchPosition(final CallbackContext callbackContext) {
        TSCallback callback = new TSCallback() {
            public void onSuccess() {
                JSONArray callbackIds = new JSONArray();
                Iterator<CallbackContext> iterator = watchPositionCallbacks.iterator();
                while (iterator.hasNext()) {
                    CallbackContext cb = iterator.next();
                    callbackIds.put(cb.getCallbackId());
                    iterator.remove();
                }
                callbackContext.success(callbackIds);
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        };
        getAdapter().stopWatchPosition(callback);
    }

    private void addGeofence(final CallbackContext callbackContext, JSONObject config) {
        getAdapter().addGeofence(config, new TSCallback() {
            public void onSuccess() {
                callbackContext.success();
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void addGeofences(final CallbackContext callbackContext, JSONArray geofences) {
        getAdapter().addGeofences(geofences, new TSCallback() {
            public void onSuccess() {
                callbackContext.success();
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void getGeofences(final CallbackContext callbackContext) {
        getAdapter().getGeofences(new TSGetGeofencesCallback() {
            public void onSuccess(List<TSGeofence> geofences) {
                JSONArray data = new JSONArray();
                for (TSGeofence geofence : geofences) {
                    data.put(geofence.toJson());
                }
                callbackContext.success(data);
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }
    private void getOdometer(CallbackContext callbackContext) {
        PluginResult result = new PluginResult(PluginResult.Status.OK, getAdapter().getOdometer());
        callbackContext.sendPluginResult(result);
    }

    private void setOdometer(Float value, final CallbackContext callbackContext) {
        TSLocationCallback callback = new TSLocationCallback() {
            public void onLocation(TSLocation location) {
                callbackContext.success(location.toJson());
            }
            public void onError(Integer error) {
                callbackContext.error(error);
            }
        };
        getAdapter().setOdometer(value, callback);
    }

    private void removeListener(String event, String callbackId, CallbackContext callbackContext) {
        Iterator<CordovaCallback> iterator = cordovaCallbacks.iterator();
        CordovaCallback found = null;
        while (iterator.hasNext() && (found == null)) {
            CordovaCallback cordovaCallback = iterator.next();
            if (cordovaCallback.callbackId.equalsIgnoreCase(callbackId)) {
                found = cordovaCallback;
            }
        }
        if (found != null) {
            cordovaCallbacks.remove(found);
            getAdapter().removeListener(event, found.callback);
            callbackContext.success();
        } else {
            TSLog.logger.warn(TSLog.warn("Failed to find listener for event: " + event));
            callbackContext.error(404);
        }
    }

    private void removeListeners(CallbackContext callbackContext) {
        getAdapter().removeListeners();
        cordovaCallbacks.clear();
        callbackContext.success();
    }

    private void addGeofenceListener(final CallbackContext callbackContext) {
        TSGeofenceCallback callback = new TSGeofenceCallback() {
            @Override
            public void onGeofence(GeofenceEvent event) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, event.toJson());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onGeofence(callback);
    }

    private void addGeofencesChangeListener(final CallbackContext callbackContext) {
        TSGeofencesChangeCallback callback = new TSGeofencesChangeCallback() {
            @Override
            public void onGeofencesChange(GeofencesChangeEvent event) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, event.toJson());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onGeofencesChange(callback);
    }

    private void addPowerSaveChangeListener(final CallbackContext callbackContext) {
        TSPowerSaveChangeCallback callback = new TSPowerSaveChangeCallback() {
            @Override
            public void onPowerSaveChange(Boolean isPowerSaveMode) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, isPowerSaveMode);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onPowerSaveChange(callback);
    }
    private void addHeartbeatListener(final CallbackContext callbackContext) {
        TSHeartbeatCallback callback = new TSHeartbeatCallback() {
            @Override
            public void onHeartbeat(HeartbeatEvent event) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, event.toJson());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onHeartbeat(callback);
    }

    private void addActivityChangeListener(final CallbackContext callbackContext) {
        TSActivityChangeCallback callback = new TSActivityChangeCallback() {
            @Override
            public void onActivityChange(ActivityChangeEvent event) {

                PluginResult result = new PluginResult(PluginResult.Status.OK, event.toJson());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onActivityChange(callback);
    }

    private void addProviderChangeListener(final CallbackContext callbackContext) {
        TSLocationProviderChangeCallback callback = new TSLocationProviderChangeCallback() {
            @Override
            public void onLocationProviderChange(LocationProviderChangeEvent event) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, event.toJson());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onLocationProviderChange(callback);
    }
    private void addScheduleListener(final CallbackContext callbackContext) {
        TSScheduleCallback callback = new TSScheduleCallback() {
            @Override
            public void onSchedule(ScheduleEvent event) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, event.getState());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onSchedule(callback);

    }

    private void addLocationListener(final CallbackContext callbackContext) {
        TSLocationCallback callback = new TSLocationCallback() {
            @Override
            public void onLocation(TSLocation location) {
                PluginResult result = new PluginResult(PluginResult.Status.OK, location.toJson());
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
            @Override
            public void onError(Integer errorCode) {
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, errorCode);
                result.setKeepCallback(true);
                callbackContext.sendPluginResult(result);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onLocation(callback);
    }

    private void registerCallback(CallbackContext cordovaCallback, Object tsCallback) {
        cordovaCallbacks.add(new CordovaCallback(cordovaCallback.getCallbackId(), tsCallback));
    }

    private void addMotionChangeListener(final CallbackContext callbackContext) {
        TSLocationCallback callback = new TSLocationCallback() {
            @Override
            public void onLocation(TSLocation location) {
                JSONObject params = new JSONObject();
                try {
                    params.put("isMoving", location.getIsMoving());
                    params.put("location", location.toJson());
                    PluginResult result = new PluginResult(PluginResult.Status.OK, params);
                    result.setKeepCallback(true);
                    callbackContext.sendPluginResult(result);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            @Override
            public void onError(Integer error) {
                callbackContext.error(error);
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onMotionChange(callback);
    }

    private void addHttpListener(final CallbackContext callbackContext) {
        TSHttpResponseCallback callback = new TSHttpResponseCallback() {
            @Override
            public void onHttpResponse(HttpResponse response) {
                JSONObject params = new JSONObject();
                try {
                    params.put("status", response.status);
                    params.put("responseText", response.responseText);
                    PluginResult result = new PluginResult((response.isSuccess()) ? PluginResult.Status.OK : PluginResult.Status.ERROR, params);
                    result.setKeepCallback(true);
                    callbackContext.sendPluginResult(result);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
        registerCallback(callbackContext, callback);
        getAdapter().onHttp(callback);

    }

    private void removeGeofence(String identifier, final CallbackContext callbackContext) {
        getAdapter().removeGeofence(identifier, new TSCallback() {
            @Override
            public void onSuccess() {
                callbackContext.success();
            }
            @Override
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void removeGeofences(final JSONArray identifiers, final CallbackContext callbackContext) {
        List<String> rs = new ArrayList<String>();
        try {
            for (int i = 0; i < identifiers.length(); i++) {
                rs.add(identifiers.getString(i));
            }
            getAdapter().removeGeofences(rs, new TSCallback() {
                @Override
                public void onSuccess() {
                    callbackContext.success();
                }

                @Override
                public void onFailure(String error) {
                    callbackContext.error(error);
                }
            });
        } catch (JSONException e) {
            callbackContext.error(e.getMessage());
            e.printStackTrace();
        }
    }

    private void insertLocation(JSONObject params, final CallbackContext callbackContext) {
        getAdapter().insertLocation(params, new TSInsertLocationCallback() {
            @Override
            public void onSuccess(String uuid) {
                callbackContext.success(uuid);
            }
            @Override
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void setConfig(final JSONObject config, final CallbackContext callbackContext) throws JSONException {
        if (config.has("enableHeadless") && config.getBoolean("enableHeadless")) {
            config.put("headlessJobService", getClass().getPackage().getName() + "." + HEADLESS_JOB_SERVICE_CLASS);
        }
        TSCallback callback = new TSCallback() {
            @Override
            public void onSuccess() {
                callbackContext.success(getAdapter().getState());
            }
            @Override
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        };
        getAdapter().setConfig(config, callback);
    }

    private void destroyLocations(final CallbackContext callbackContext) {
        getAdapter().destroyLocations(new TSCallback() {
            public void onSuccess() {
                callbackContext.success();
            }
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void getLog(final CallbackContext callbackContext) {
        getAdapter().getLog(new TSGetLogCallback() {
            @Override
            public void onSuccess(String log) {
                callbackContext.success(log);
            }
            @Override
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void destroyLog(final CallbackContext callbackContext) {
        getAdapter().destroyLog(new TSCallback() {
            @Override
            public void onSuccess() {
                callbackContext.success();
            }
            @Override
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void emailLog(String email, final CallbackContext callbackContext) {
        getAdapter().emailLog(email, cordova.getActivity(), new TSEmailLogCallback() {
            @Override
            public void onSuccess() {
                callbackContext.success();
            }
            @Override
            public void onFailure(String error) {
                callbackContext.error(error);
            }
        });
    }

    private void log(JSONArray arguments, CallbackContext callbackContext) throws JSONException {
        String level = arguments.getString(0);
        String message = arguments.getString(1);
        TSLog.log(level, message);
        callbackContext.success();
    }

    public void onPause(boolean multitasking) {
        Log.i(TAG, "- onPause");
    }
    public void onResume(boolean multitasking) {
        Log.i(TAG, "- onResume");
    }

    private JSONObject getState() {
        return getAdapter().getState();
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

    private void isPowerSaveMode(CallbackContext callbackContext) {
        PluginResult result = new PluginResult(PluginResult.Status.OK, getAdapter().isPowerSaveMode());
        callbackContext.sendPluginResult(result);
    }

    private void onError(String error) {
        String message = "BG Geolocation caught a Javascript exception while running in background-thread:\n".concat(error);
        Log.e(TAG,message);

        // Show alert popup with js error
        if (Settings.getDebug()) {
            getAdapter().startTone(android.media.ToneGenerator.TONE_CDMA_HIGH_S_X4);
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

    private void handlePlayServicesConnectError(Integer errorCode) {
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

    private class CordovaCallback {
        public String callbackId;
        public Object callback;

        public CordovaCallback(String _callbackId, Object _callback) {
            callbackId  = _callbackId;
            callback    = _callback;
        }
    }
}
