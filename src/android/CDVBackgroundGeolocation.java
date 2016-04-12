package com.transistorsoft.cordova.bggeo;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.Iterator;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.Manifest;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.location.DetectedActivity;
import com.transistorsoft.locationmanager.BackgroundGeolocationService;
import com.transistorsoft.locationmanager.Settings;
import com.google.android.gms.location.GeofencingEvent;
import android.app.AlertDialog;
import android.content.DialogInterface;

import de.greenrobot.event.EventBus;
import de.greenrobot.event.Subscribe;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.Environment;
import android.util.Log;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.widget.Toast;

public class CDVBackgroundGeolocation extends CordovaPlugin {
    private static final String TAG = "TSLocationManager";

    public static final String ACCESS_COARSE_LOCATION = Manifest.permission.ACCESS_COARSE_LOCATION;
    public static final String ACCESS_FINE_LOCATION = Manifest.permission.ACCESS_FINE_LOCATION;

    public static final int REQUEST_ACTION_START = 1;
    public static final int REQUEST_ACTION_GET_CURRENT_POSITION = 2;


    private static CordovaWebView gWebView;
    public static Boolean forceReload = false;

    /**
     * Timeout in millis for a getCurrentPosition request to give up.
     * TODO make configurable.
     */
    private static final long GET_CURRENT_POSITION_TIMEOUT = 30000;

    public static final String ACTION_FINISH            = "finish";
    public static final String ACTION_ERROR             = "error";
    public static final String ACTION_CONFIGURE         = "configure";
    public static final String ACTION_SET_CONFIG        = "setConfig";
    public static final String ACTION_ADD_MOTION_CHANGE_LISTENER    = "addMotionChangeListener";
    public static final String ACTION_ADD_LOCATION_LISTENER = "addLocationListener";
    public static final String ACTION_ON_GEOFENCE       = "onGeofence";
    public static final String ACTION_PLAY_SOUND        = "playSound";
    public static final String ACTION_ACTIVITY_RELOAD   = "activityReload";
    public static final String ACTION_GET_STATE         = "getState";
    public static final String ACTION_ADD_HTTP_LISTENER = "addHttpListener";
    public static final String ACTION_GET_LOG           = "getLog";
    public static final String ACTION_EMAIL_LOG         = "emailLog";

    private SharedPreferences settings;
    private Boolean isStarting          = false;
    private Boolean isEnabled           = false;
    private Boolean stopOnTerminate     = false;
    private Boolean isMoving;
    private Boolean isAcquiringCurrentPosition = false;
    private Intent backgroundServiceIntent;
    private JSONObject mConfig;

    private DetectedActivity currentActivity;

    private CallbackContext startCallback;
    // Geolocation callback
    private CallbackContext getLocationsCallback;
    private CallbackContext syncCallback;
    private CallbackContext paceChangeCallback;
    private CallbackContext getGeofencesCallback;
    private ToneGenerator toneGenerator;

    private List<CallbackContext> locationCallbacks = new ArrayList<CallbackContext>();
    private List<CallbackContext> motionChangeCallbacks = new ArrayList<CallbackContext>();
    private List<CallbackContext> geofenceCallbacks = new ArrayList<CallbackContext>();
    private List<CallbackContext> currentPositionCallbacks = new ArrayList<CallbackContext>();
    private Map<String, CallbackContext> addGeofenceCallbacks = new HashMap<String, CallbackContext>();
    private List<CallbackContext> httpResponseCallbacks = new ArrayList<CallbackContext>();
    private Map<String, CallbackContext> insertLocationCallbacks = new HashMap<String, CallbackContext>();
    private List<CallbackContext> getCountCallbacks = new ArrayList<CallbackContext>();

    public static boolean isActive() {
        return gWebView != null;
    }

    @Override
    protected void pluginInitialize() {
        gWebView = this.webView;

        Activity activity = this.cordova.getActivity();
                
        settings = activity.getSharedPreferences("TSLocationManager", 0);
        Settings.init(settings);

        toneGenerator = new ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100);

        Intent launchIntent = activity.getIntent();
        if (launchIntent.hasExtra("forceReload")) {
            // When Activity is launched due to forceReload, minimize the app.
            activity.moveTaskToBack(true);
        }
    }

    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "$ " + action + "()");

        Boolean result      = false;

        if (BackgroundGeolocationService.ACTION_START.equalsIgnoreCase(action)) {
            result      = true;
            if (!isStarting) {
                this.start(callbackContext);
            } else {
                callbackContext.error("- Waiting for previous start action to complete");
            }
        } else if (BackgroundGeolocationService.ACTION_STOP.equalsIgnoreCase(action)) {
            // No implementation to stop background-tasks with Android.  Just say "success"
            result      = true;
            this.stop();
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
        } else if (ACTION_ADD_LOCATION_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addLocationListener(callbackContext);
        } else if (BackgroundGeolocationService.ACTION_CHANGE_PACE.equalsIgnoreCase(action)) {
            result = true;
            if (!isEnabled) {
                Log.w(TAG, "- Cannot change pace while disabled");
                callbackContext.error("Cannot #changePace while disabled");
            } else {
                changePace(callbackContext, data);
            }
        } else if (BackgroundGeolocationService.ACTION_SET_CONFIG.equalsIgnoreCase(action)) {
            result = true;
            JSONObject config = data.getJSONObject(0);
            setConfig(config);
            callbackContext.success();
        } else if (ACTION_GET_STATE.equalsIgnoreCase(action)) {
            result = true;
            JSONObject state = this.getState();
            PluginResult response = new PluginResult(PluginResult.Status.OK, state);
            response.setKeepCallback(false);
            callbackContext.sendPluginResult(response);
        } else if (ACTION_ADD_MOTION_CHANGE_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            this.addMotionChangeListener(callbackContext);
        } else if (BackgroundGeolocationService.ACTION_GET_LOCATIONS.equalsIgnoreCase(action)) {
            result = true;
            getLocations(callbackContext);
        } else if (BackgroundGeolocationService.ACTION_SYNC.equalsIgnoreCase(action)) {
            result = true;
            sync(callbackContext);
        } else if (BackgroundGeolocationService.ACTION_GET_ODOMETER.equalsIgnoreCase(action)) {
            result = true;
            getOdometer(callbackContext);
        } else if (BackgroundGeolocationService.ACTION_RESET_ODOMETER.equalsIgnoreCase(action)) {
            result = true;
            resetOdometer(callbackContext);
        } else if (BackgroundGeolocationService.ACTION_ADD_GEOFENCE.equalsIgnoreCase(action)) {
            result = true;
            addGeofence(callbackContext, data.getJSONObject(0));
        } else if (BackgroundGeolocationService.ACTION_ADD_GEOFENCES.equalsIgnoreCase(action)) {
            result = true;
            addGeofences(callbackContext, data.getJSONArray(0));
        } else if (BackgroundGeolocationService.ACTION_REMOVE_GEOFENCE.equalsIgnoreCase(action)) {
            result = removeGeofence(data.getString(0));
            if (result) {
                callbackContext.success();
            }  else {
                callbackContext.error("Failed to add geofence");
            }
        } else if (BackgroundGeolocationService.ACTION_REMOVE_GEOFENCES.equalsIgnoreCase(action)) {
            result = removeGeofences();
            if (result) {
                callbackContext.success();
            }  else {
                callbackContext.error("Failed to add geofence");
            }
        } else if (BackgroundGeolocationService.ACTION_ON_GEOFENCE.equalsIgnoreCase(action)) {
            result = true;
            addGeofenceListener(callbackContext);
        } else if (BackgroundGeolocationService.ACTION_GET_GEOFENCES.equalsIgnoreCase(action)) {
            result = true;
            getGeofences(callbackContext);
        } else if (ACTION_PLAY_SOUND.equalsIgnoreCase(action)) {
            result = true;
            playSound(data.getInt(0));
            callbackContext.success();
        } else if (BackgroundGeolocationService.ACTION_GET_CURRENT_POSITION.equalsIgnoreCase(action)) {
            result = true;
            JSONObject options = data.getJSONObject(0);
            getCurrentPosition(callbackContext, options);
        } else if (BackgroundGeolocationService.ACTION_BEGIN_BACKGROUND_TASK.equalsIgnoreCase(action)) {
            // Android doesn't do background-tasks.  This is an iOS thing.  Just return a number.
            result = true;
            callbackContext.success(1);
        } else if (BackgroundGeolocationService.ACTION_CLEAR_DATABASE.equalsIgnoreCase(action)) {
            result = true;
            clearDatabase(callbackContext);
        } else if (ACTION_ADD_HTTP_LISTENER.equalsIgnoreCase(action)) {
            result = true;
            addHttpListener(callbackContext);
        } else if (ACTION_GET_LOG.equalsIgnoreCase(action)) {
            result = true;
            getLog(callbackContext);
        } else if (ACTION_EMAIL_LOG.equalsIgnoreCase(action)) {
            result = true;
            emailLog(callbackContext, data.getString(0));
        } else if (BackgroundGeolocationService.ACTION_INSERT_LOCATION.equalsIgnoreCase(action)) {
            result = true;
            insertLocation(data.getJSONObject(0), callbackContext);
        } else if (BackgroundGeolocationService.ACTION_GET_COUNT.equalsIgnoreCase(action)) {
            result = true;
            getCount(callbackContext);
        }
        return result;
    }

    private void configure(JSONObject config, CallbackContext callbackContext) {
        mConfig = config;
        boolean result = applyConfig();
        if (result) {
            boolean willEnable = settings.getBoolean("enabled", isEnabled);
            if (willEnable) {
                start(null);
            }
            PluginResult response = new PluginResult(PluginResult.Status.OK, this.getState());
            response.setKeepCallback(false);
            callbackContext.sendPluginResult(response);
        } else {
            callbackContext.error("- Configuration error!");
        }
    }

    private void start(CallbackContext callback) {
        isStarting = true;
        startCallback = callback;
        backgroundServiceIntent = new Intent(cordova.getActivity(), BackgroundGeolocationService.class);
        if (hasPermission(ACCESS_COARSE_LOCATION) && hasPermission(ACCESS_FINE_LOCATION)) {
            setEnabled(true);
        } else {
            String[] permissions = {ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION};
            requestPermissions(REQUEST_ACTION_START, permissions);
        }
    }

    private void stop() {
        startCallback = null;
        isStarting = false;
        setEnabled(false);
    }

    private void changePace(CallbackContext callbackContext, JSONArray data) throws JSONException {
        paceChangeCallback = callbackContext;
        Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_CHANGE_PACE);
        event.putBoolean("request", true);
        event.putBoolean("isMoving", data.getBoolean(0));
        postEvent(event);
    }
    private void startService(int requestCode) {
        if (hasPermission(ACCESS_FINE_LOCATION) && hasPermission(ACCESS_COARSE_LOCATION)) {
            Activity activity = cordova.getActivity();
            if (backgroundServiceIntent == null) {
                backgroundServiceIntent = new Intent(activity, BackgroundGeolocationService.class);
            }
            activity.startService(backgroundServiceIntent);
        } else {
            String[] permissions = {ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION};
            requestPermissions(requestCode, permissions);
        }
    }

    private void onStarted(Bundle event) {
        isStarting = false;
        if (event.getBoolean("response") && !event.getBoolean("success")) {
            Toast.makeText(cordova.getActivity(), event.getString("message"), Toast.LENGTH_LONG).show();
            if (startCallback != null) {
                startCallback.error(event.getString("message"));
            }
        } else if (startCallback != null) {
            startCallback.success();
        }
        startCallback = null;
    }

    private void getLocations(CallbackContext callbackContext) {
        final Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_GET_LOCATIONS);
        event.putBoolean("request", true);
        getLocationsCallback = callbackContext;
        postEventInBackground(event);
    }

    private void getCount(CallbackContext callbackContext) {
        final Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_GET_COUNT);
        event.putBoolean("request", true);
        getCountCallbacks.add(callbackContext);
        postEventInBackground(event);
    }

    private void sync(CallbackContext callbackContext) {
        syncCallback = callbackContext;
        Activity activity = this.cordova.getActivity();

        EventBus eventBus = EventBus.getDefault();
        if (!eventBus.isRegistered(this)) {
            eventBus.register(this);
        }
        if (!BackgroundGeolocationService.isInstanceCreated()) {
            Intent syncIntent = new Intent(activity, BackgroundGeolocationService.class);
            syncIntent.putExtra("command", BackgroundGeolocationService.ACTION_SYNC);
            activity.startService(syncIntent);
        } else {
            final Bundle event = new Bundle();
            event.putString("name", BackgroundGeolocationService.ACTION_SYNC);
            event.putBoolean("request", true);
            postEventInBackground(event);
        }    
    }

    private void getCurrentPosition(CallbackContext callbackContext, JSONObject options) {
        isAcquiringCurrentPosition = true;
        addCurrentPositionListener(callbackContext);

        if (!isEnabled) {
            EventBus eventBus = EventBus.getDefault();
            if (!eventBus.isRegistered(this)) {
                eventBus.register(this);
            }
            if (!BackgroundGeolocationService.isInstanceCreated()) {
                Activity activity = cordova.getActivity();
                backgroundServiceIntent = new Intent(activity, BackgroundGeolocationService.class);
                backgroundServiceIntent.putExtra("command", BackgroundGeolocationService.ACTION_GET_CURRENT_POSITION);
                backgroundServiceIntent.putExtra("options", options.toString());
                startService(REQUEST_ACTION_GET_CURRENT_POSITION);
            }
        } else {
            final Bundle event = new Bundle();
            event.putString("name", BackgroundGeolocationService.ACTION_GET_CURRENT_POSITION);
            event.putBoolean("request", true);
            event.putString("options", options.toString());
            postEventInBackground(event);
        }
    }

    private void addGeofence(CallbackContext callbackContext, JSONObject config) {
        try {
            String identifier = config.getString("identifier");
            final Bundle event = new Bundle();
            event.putString("name", BackgroundGeolocationService.ACTION_ADD_GEOFENCE);
            event.putBoolean("request", true);
            event.putFloat("radius", (float) config.getLong("radius"));
            event.putDouble("latitude", config.getDouble("latitude"));
            event.putDouble("longitude", config.getDouble("longitude"));
            event.putString("identifier", identifier);

            if (config.has("notifyOnEntry")) {
                event.putBoolean("notifyOnEntry", config.getBoolean("notifyOnEntry"));
            }
            if (config.has("notifyOnExit")) {
                event.putBoolean("notifyOnExit", config.getBoolean("notifyOnExit"));
            }
            if (config.has("notifyOnDwell")) {
                event.putBoolean("notifyOnDwell", config.getBoolean("notifyOnDwell"));
            }
            if (config.has("loiteringDelay")) {
                event.putInt("loiteringDelay", config.getInt("loiteringDelay"));
            }
            addGeofenceCallbacks.put(identifier, callbackContext);

            postEvent(event);
            
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.error(e.getMessage());
        }
    }

    private void addGeofences(CallbackContext callbackContext, JSONArray geofences) {
        
        final Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_ADD_GEOFENCES);            
        event.putBoolean("request", true);

        event.putString("geofences", geofences.toString());
        addGeofenceCallbacks.put(BackgroundGeolocationService.ACTION_ADD_GEOFENCES, callbackContext);

        postEvent(event);
    }

    private void getGeofences(CallbackContext callbackContext) {
        getGeofencesCallback = callbackContext;
        Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_GET_GEOFENCES);
        event.putBoolean("request", true);
        postEventInBackground(event);
    }
    private void getOdometer(CallbackContext callbackContext) {
        Float value = settings.getFloat("odometer", 0);
        PluginResult result = new PluginResult(PluginResult.Status.OK, value);
        callbackContext.sendPluginResult(result);
    }

    private void resetOdometer(CallbackContext callbackContext) {
        SharedPreferences.Editor editor = settings.edit();
        editor.putFloat("odometer", 0);
        editor.apply();

        if (BackgroundGeolocationService.isInstanceCreated()) {
            Bundle event = new Bundle();
            event.putString("name", BackgroundGeolocationService.ACTION_RESET_ODOMETER);
            event.putBoolean("request", true);
            postEventInBackground(event);
        }
        callbackContext.success();
    }

    private void onResetOdometer(Bundle event) {
        // Received event from BackgroundService.  Do Nothing.  Callback already callced in #resetOdometer.
    }

    private void onAddGeofence(Bundle event) {
        boolean success = event.getBoolean("success");
        String identifier = event.getString("identifier");

        if (addGeofenceCallbacks.containsKey(identifier)) {
            CallbackContext callbackContext = addGeofenceCallbacks.get(identifier);
            if (success) {
                callbackContext.success();
            } else {
                callbackContext.error(event.getString("error"));
            }
            addGeofenceCallbacks.remove(identifier);
        }
    }

    private void addGeofenceListener(CallbackContext callbackContext) {
        geofenceCallbacks.add(callbackContext);

        Activity activity   = this.cordova.getActivity();
        Intent launchIntent = activity.getIntent();
        if (launchIntent.hasExtra("forceReload") && launchIntent.hasExtra("geofencingEvent")) {
            try {
                JSONObject geofencingEvent  = new JSONObject(launchIntent.getStringExtra("geofencingEvent"));
                handleGeofencingEvent(geofencingEvent);
            } catch (JSONException e) {
                Log.w(TAG, e);
            }
        }
    }

    private void addCurrentPositionListener(CallbackContext callbackContext) {
        currentPositionCallbacks.add(callbackContext);
    }

    private void addLocationListener(CallbackContext callbackContext) {
        locationCallbacks.add(callbackContext);
    }

    private void addMotionChangeListener(CallbackContext callbackContext) {
        motionChangeCallbacks.add(callbackContext);

        Activity activity = this.cordova.getActivity();
        Intent launchIntent = activity.getIntent();

        if (launchIntent.hasExtra("forceReload")) {
            if (launchIntent.getStringExtra("name").equalsIgnoreCase(BackgroundGeolocationService.ACTION_ON_MOTION_CHANGE)) {
                Bundle event = launchIntent.getExtras();
                this.onEventMainThread(event);
            }
            launchIntent.removeExtra("forceReload");
            launchIntent.removeExtra("location");
        }
    }

    private void addHttpListener(CallbackContext callbackContext) {
        httpResponseCallbacks.add(callbackContext);
    }

    private Boolean removeGeofence(String identifier) {
        final Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_REMOVE_GEOFENCE);
        event.putBoolean("request", true);
        event.putString("identifier", identifier);
        postEvent(event);
        return true;
    }

    private Boolean removeGeofences() {
        final Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_REMOVE_GEOFENCES);
        event.putBoolean("request", true);
        postEvent(event);
        return true;
    }

    private void insertLocation(JSONObject params, CallbackContext callbackContext) {
        if (!BackgroundGeolocationService.isInstanceCreated()) {
            Log.i(TAG, "Cannot insertLocation when the BackgroundGeolocationService is not running.  Plugin must be started first");
            return;
        }
        if (!params.has("uuid")) {
            callbackContext.error("insertLocation params must contain uuid");
            return;
        }
        if (!params.has("timestamp")) {
            callbackContext.error("insertLocation params must contain timestamp");
            return;
        }
        if (!params.has("coords")) {
            callbackContext.error("insertLocation params must contains a coords {}");
            return;
        }
        Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_INSERT_LOCATION);
        event.putBoolean("request", true);

        try {
            String uuid = params.getString("uuid");
            event.putString("location", params.toString());
            insertLocationCallbacks.put(uuid, callbackContext);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        postEvent(event);
    }
    private void setEnabled(boolean value) {
        // Don't set a state that we're already in.
        Log.i(TAG, "- Enable: " + isEnabled + " → " + value);

        Activity activity = cordova.getActivity();
        boolean wasEnabled = isEnabled;
        isEnabled = value;
        isMoving = null;

        Intent launchIntent = activity.getIntent();

        if (launchIntent.hasExtra("forceReload")) {
            if (launchIntent.hasExtra("location")) {
                try {
                    JSONObject location = new JSONObject(launchIntent.getStringExtra("location"));
                    onLocationChange(location);
                } catch (JSONException e) {
                    Log.w(TAG, e);
                }
            }
        }

        SharedPreferences.Editor editor = settings.edit();
        editor.putBoolean("enabled", isEnabled);
        editor.apply();

        EventBus eventBus = EventBus.getDefault();
        if (isEnabled) {
            synchronized(eventBus) {
                if (!eventBus.isRegistered(this)) {
                    eventBus.register(this);
                }
            }
            if (!BackgroundGeolocationService.isInstanceCreated()) {
                activity.startService(backgroundServiceIntent);
            } else {
                final Bundle event = new Bundle();
                if (!wasEnabled) {
                    event.putString("name", BackgroundGeolocationService.ACTION_START);
                } else {
                    event.putString("name", BackgroundGeolocationService.ACTION_GET_CURRENT_POSITION);
                }
                event.putBoolean("request", true);
                postEvent(event);
                onStarted(event);
            }
        } else {
            Bundle event = new Bundle();
            event.putString("name", BackgroundGeolocationService.ACTION_STOP);
            event.putBoolean("request", true);
            postEvent(event);

            synchronized(eventBus) {
                if (eventBus.isRegistered(this)) {
                    eventBus.unregister(this);
                }
            }
            //activity.stopService(backgroundServiceIntent);
            backgroundServiceIntent = null;
        }
    }

    private boolean setConfig(JSONObject config) {
        try {
            JSONObject merged = new JSONObject();
            JSONObject[] objs = new JSONObject[] { mConfig, config };
            for (JSONObject obj : objs) {
                Iterator it = obj.keys();
                while (it.hasNext()) {
                    String key = (String)it.next();
                    merged.put(key, obj.get(key));
                }
            }
            mConfig = merged;
        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }

        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                applyConfig();
                Bundle event = new Bundle();
                event.putString("name", BackgroundGeolocationService.ACTION_SET_CONFIG);
                event.putBoolean("request", true);
                postEvent(event);
            }
        });
        return true;
    }

    private boolean applyConfig() {
        if (mConfig.has("stopOnTerminate")) {
            try {
                stopOnTerminate = mConfig.getBoolean("stopOnTerminate");
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        SharedPreferences.Editor editor = settings.edit();

        try {
            if (preferences.contains("cordova-background-geolocation-license")) {
                mConfig.put("license", preferences.getString("cordova-background-geolocation-license", null));
            }
            if (preferences.contains("cordova-background-geolocation-orderId")) {
                mConfig.put("orderId", preferences.getString("cordova-background-geolocation-orderId", null));
            }
            if (mConfig.has("isMoving")) {
                editor.putBoolean("isMoving", mConfig.getBoolean("isMoving"));
            }
        } catch (JSONException e) {
            e.printStackTrace();
            Log.w(TAG, "- Failed to apply license");
        }
        editor.putString("config", mConfig.toString());
        editor.apply();

        return true;
    }

    private void clearDatabase(CallbackContext callbackContext) {
        final Bundle event = new Bundle();
        event.putString("name", BackgroundGeolocationService.ACTION_CLEAR_DATABASE);
        event.putBoolean("request", true);
        postEventInBackground(event);
        callbackContext.success();  
    }

    private String readLog() {
        try {
            Process process = Runtime.getRuntime().exec("logcat -d");
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            StringBuilder log = new StringBuilder();
            String line = "";
            while ((line = bufferedReader.readLine()) != null) {
                log.append(line + "\n");
            }
            return log.toString();
        }
        catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
    private void getLog(final CallbackContext callback) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                String log = readLog();
                if (log != null) {
                    callback.success(log);
                } else {
                    callback.error("Failed to read logs");
                }
            }
        });
    }
    private void emailLog(final CallbackContext callback, final String email) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                String log = readLog();
                if (log == null) {
                    callback.error(500);
                    return;
                }

                Intent mailer = new Intent(Intent.ACTION_SEND);
                mailer.setType("message/rfc822");
                mailer.putExtra(Intent.EXTRA_EMAIL, new String[]{email});
                mailer.putExtra(Intent.EXTRA_SUBJECT, "BackgroundGeolocation log");

                try {
                    JSONObject state = getState();
                    if (state.has("license")) {
                        state.put("license", "<SECRET>");
                    }
                    if (state.has("orderId")) {
                        state.put("orderId", "<SECRET>");
                    }
                    mailer.putExtra(Intent.EXTRA_TEXT, state.toString(4));
                } catch (JSONException e) {
                    Log.w(TAG, "- Failed to write state to email body");
                    e.printStackTrace();
                }
                File file = new File(Environment.getExternalStorageDirectory(), "background-geolocation.log");
                try {
                    FileOutputStream stream = new FileOutputStream(file);
                    try {
                        stream.write(log.getBytes());
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
                    callback.success();
                } catch (android.content.ActivityNotFoundException ex) {
                    Toast.makeText(cordova.getActivity(), "There are no email clients installed.", Toast.LENGTH_SHORT).show();
                    callback.error("There are no email clients installed");
                }
            }
        });
    }
    public void onPause(boolean multitasking) {
        Log.i(TAG, "- onPause");
        if (isEnabled) {

        }
    }
    public void onResume(boolean multitasking) {
        Log.i(TAG, "- onResume");
        if (isEnabled) {

        }
    }

    /**
     * EventBus listener for Event Bundle
     * @param {Bundle} event
     */
    @Subscribe
    public void onEventMainThread(Bundle event) {
        if (event.containsKey("request")) {
            return;
        }
        String name = event.getString("name");

        if (BackgroundGeolocationService.ACTION_START.equalsIgnoreCase(name)) {
            onStarted(event);
        } else if (BackgroundGeolocationService.ACTION_ON_MOTION_CHANGE.equalsIgnoreCase(name)) {
            boolean nowMoving = event.getBoolean("isMoving");
            try {
                JSONObject locationData = new JSONObject(event.getString("location"));
                onMotionChange(nowMoving, locationData);
            } catch (JSONException e) {
                Log.e(TAG, "Error decoding JSON");
                e.printStackTrace();
            }
        } else if (BackgroundGeolocationService.ACTION_GET_LOCATIONS.equalsIgnoreCase(name)) {
            try {
                JSONObject params = new JSONObject();
                params.put("locations", new JSONArray(event.getString("data")));
                params.put("taskId", "android-bg-task-id");
                PluginResult result = new PluginResult(PluginResult.Status.OK, params);
                getLocationsCallback.sendPluginResult(result);
            } catch (JSONException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
                PluginResult result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage());
                getLocationsCallback.sendPluginResult(result);
            }
        } else if (BackgroundGeolocationService.ACTION_SYNC.equalsIgnoreCase(name)) {
            Boolean success = event.getBoolean("success");
            if (success) {
                try {
                    JSONObject params       = new JSONObject();
                    params.put("locations", new JSONArray(event.getString("data")));
                    params.put("taskId", "android-bg-task-id");
                    PluginResult result = new PluginResult(PluginResult.Status.OK, params);
                    syncCallback.sendPluginResult(result);
                } catch (JSONException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            } else {
                PluginResult result = new PluginResult(PluginResult.Status.IO_EXCEPTION, event.getString("message"));
                syncCallback.sendPluginResult(result);
            }
        } else if (BackgroundGeolocationService.ACTION_RESET_ODOMETER.equalsIgnoreCase(name)) {
            this.onResetOdometer(event);
        } else if (BackgroundGeolocationService.ACTION_CHANGE_PACE.equalsIgnoreCase(name)) {
            this.onChangePace(event);
        } else if (BackgroundGeolocationService.ACTION_GET_GEOFENCES.equalsIgnoreCase(name)) {
            try {
                JSONArray json      = new JSONArray(event.getString("data"));
                PluginResult result = new PluginResult(PluginResult.Status.OK, json);
                getGeofencesCallback.sendPluginResult(result);
            } catch (JSONException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
                PluginResult result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage());
                getGeofencesCallback.sendPluginResult(result);
            }
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_GOOGLE_PLAY_SERVICES_CONNECT_ERROR)) {
            GoogleApiAvailability.getInstance().getErrorDialog(this.cordova.getActivity(), event.getInt("errorCode"), 1001).show();
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_LOCATION_ERROR)) {
            this.onLocationError(event);
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_ADD_GEOFENCE)) {
            this.onAddGeofence(event);
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_ADD_GEOFENCES)) {
            this.onAddGeofence(event);
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_HTTP_RESPONSE)) {
            this.onHttpResponse(event);
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_GET_CURRENT_POSITION)) {
            this.onLocationError(event);
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_INSERT_LOCATION)) {
            this.onInsertLocation(event);
        } else if (name.equalsIgnoreCase(BackgroundGeolocationService.ACTION_GET_COUNT)) {
            this.onGetCount(event);
        }
    }

    private void finishAcquiringCurrentPosition(boolean success) {
        // Current position has arrived:  release the hounds.
        isAcquiringCurrentPosition = false;
        // When currentPosition is explicitly requested while plugin is stopped, shut Service down again and stop listening to EventBus

        if (!isEnabled) {
            EventBus eventBus = EventBus.getDefault();
            synchronized(eventBus) {
                if (eventBus.isRegistered(this)) {
                    eventBus.unregister(this);
                }
            }
        }
    }
    public void onHttpResponse(Bundle event) {
        PluginResult result;
        try {
            JSONObject params = new JSONObject();
            params.put("status", event.getInt("status"));
            params.put("responseText", event.getString("responseText"));
            result = new PluginResult(PluginResult.Status.OK, params);
        } catch (JSONException e) {
            e.printStackTrace();
            result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage());
        }
        result.setKeepCallback(true);
        for (CallbackContext callback : httpResponseCallbacks) {
            callback.sendPluginResult(result);
        }
    }

    private void onInsertLocation(Bundle event) {
        String uuid = event.getString("uuid");
        Log.i(TAG, "- Cordova plugin: onInsertLocation: " + uuid);
        if (insertLocationCallbacks.containsKey(uuid)) {
            CallbackContext callback = insertLocationCallbacks.get(uuid);
            callback.success();
        } else {
            Log.i(TAG, "- onInsertLocation failed to find its success-callback for " + uuid);
        }
    }

    private void onGetCount(Bundle event) {
        int count = event.getInt("count");
        Log.i(TAG, "- Cordova plugin: getCount: " + count);

        for (CallbackContext callback : getCountCallbacks) {
            callback.success(count);
        }
        getCountCallbacks.clear();
    }

    private void onMotionChange(boolean nowMoving, JSONObject location) {
        isMoving = nowMoving;
        PluginResult result;

        try {
            JSONObject params = new JSONObject();
            params.put("location", location);
            params.put("isMoving", isMoving);
            params.put("taskId", "android-bg-task-id");
            result = new PluginResult(PluginResult.Status.OK, params);
        } catch (JSONException e) {
            e.printStackTrace();
            result = new PluginResult(PluginResult.Status.JSON_EXCEPTION, e.getMessage());
        }
        result.setKeepCallback(true);
        for (CallbackContext callback : motionChangeCallbacks) {
            callback.sendPluginResult(result);
        }
    }
    private void onChangePace(Bundle event) {
        Boolean success = event.getBoolean("success");
        if (success) {
            int state = event.getBoolean("isMoving") ? 1 : 0;
            paceChangeCallback.success(state);
        } else {
            paceChangeCallback.error(event.getInt("code"));
        }
    }
    private JSONObject getState() {
        JSONObject state = new JSONObject();
        try {
            if (settings.contains("config")) {
                state = new JSONObject(settings.getString("config", "{}"));
            }
            state.put("enabled", isEnabled);
            state.put("isMoving", isMoving);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return state;
    }

    /**
     * EventBus listener
     * @param {Location} location
     */
    @Subscribe
    public void onEventMainThread(Location location) {
        JSONObject locationData = BackgroundGeolocationService.locationToJson(location, currentActivity);

        Bundle meta = location.getExtras();
        if (meta != null) {
            String action = meta.getString("action");
            boolean motionChanged = action.equalsIgnoreCase(BackgroundGeolocationService.ACTION_ON_MOTION_CHANGE);
            if (motionChanged) {
                boolean nowMoving = meta.getBoolean("isMoving");
                onMotionChange(nowMoving, locationData);
            }
        }
        this.onLocationChange(locationData);
    }
    private void onLocationChange(JSONObject location) {
        PluginResult result = new PluginResult(PluginResult.Status.OK, location);
        result.setKeepCallback(true);
        for (CallbackContext callback : locationCallbacks) {
            callback.sendPluginResult(result);
        }
        if (isAcquiringCurrentPosition) {
            finishAcquiringCurrentPosition(true);
            // Execute callbacks.
            result = new PluginResult(PluginResult.Status.OK, location);
            result.setKeepCallback(false);
            for (CallbackContext callback : currentPositionCallbacks) {
                callback.sendPluginResult(result);
            }
            currentPositionCallbacks.clear();
        }
    }
    
    /**
     * EventBus handler for Geofencing events
     */
    @Subscribe
    public void onEventMainThread(GeofencingEvent geofenceEvent) {
        Log.i(TAG, "- Rx GeofencingEvent: " + geofenceEvent);

        if (!geofenceCallbacks.isEmpty()) {
            JSONObject params = BackgroundGeolocationService.geofencingEventToJson(geofenceEvent, currentActivity);
            handleGeofencingEvent(params);
        }
    }
    private void handleGeofencingEvent(JSONObject params) {
        PluginResult result = new PluginResult(PluginResult.Status.OK, params);
        result.setKeepCallback(true);
        for (CallbackContext callback : geofenceCallbacks) {
            callback.sendPluginResult(result);
        }
    }

    private void playSound(int soundId) {
        int duration = 1000;
        toneGenerator = new ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100);
        toneGenerator.startTone(soundId, duration);
    }

    private void postEvent(Bundle event) {
        EventBus.getDefault().post(event);
    }

    private void postEventInBackground(final Bundle event) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                EventBus.getDefault().post(event);
            }
        });
    }

    private Boolean isDebugging() {
        return settings.contains("debug") && settings.getBoolean("debug", false);
    }

    private void onError(String error) {
        String message = "BG Geolocation caught a Javascript exception while running in background-thread:\n".concat(error);
        Log.e(TAG, message);

        // Show alert popup with js error
        if (isDebugging()) {
            playSound(68);
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

    private void onGetCurrentPositionFailure(Bundle event) {
        finishAcquiringCurrentPosition(false);
        for (CallbackContext callback : currentPositionCallbacks) {
            callback.error(408); // aka HTTP 408 Request Timeout
        }
        currentPositionCallbacks.clear();
    }

    private void onLocationError(Bundle event) {
        Integer code = event.getInt("code");
        if (code == BackgroundGeolocationService.LOCATION_ERROR_DENIED) {
            if (isDebugging()) {
                Toast.makeText(this.cordova.getActivity(), "Location services disabled!", Toast.LENGTH_SHORT).show();
            }
        }
        PluginResult result = new PluginResult(PluginResult.Status.ERROR, code);
        result.setKeepCallback(true);
        for (CallbackContext callback : locationCallbacks) {
            callback.sendPluginResult(result);
        }

        if (isAcquiringCurrentPosition) {
            finishAcquiringCurrentPosition(false);
            for (CallbackContext callback : currentPositionCallbacks) {
                callback.error(code);
            }
            currentPositionCallbacks.clear();
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

    private void requestPermissions(int requestCode, String[] action) {
        try {
            Method methodToFind = cordova.getClass().getMethod("requestPermissions", CordovaPlugin.class, int.class, String[].class);
            if (methodToFind != null) {
                try {
                    methodToFind.invoke(cordova, this, requestCode, action);
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
        for(int r:grantResults) {
            if(r == PackageManager.PERMISSION_DENIED) {
                int errorCode = BackgroundGeolocationService.LOCATION_ERROR_DENIED;
                PluginResult result = new PluginResult(PluginResult.Status.ERROR, errorCode);
                if (requestCode == REQUEST_ACTION_START) {
                    if (startCallback != null) {
                        startCallback.sendPluginResult(result);
                        startCallback = null;
                    }
                } else if (requestCode == REQUEST_ACTION_GET_CURRENT_POSITION) {
                    Bundle event = new Bundle();
                    event.putString("name", BackgroundGeolocationService.ACTION_GET_CURRENT_POSITION);
                    event.putInt("code", errorCode);
                    onLocationError(event);
                }
                return;
            }
        }
        switch(requestCode)
        {
            case REQUEST_ACTION_START:
                setEnabled(true);
                break;
            case REQUEST_ACTION_GET_CURRENT_POSITION:
                startService(requestCode);
                break;
        }
    }

    /**
     * Override method in CordovaPlugin.
     * Checks to see if it should turn off
     */
    public void onDestroy() {
        Log.i(TAG, "- onDestroy");
        Log.i(TAG, "  stopOnTerminate: " + stopOnTerminate);
        Log.i(TAG, "  isEnabled: " + isEnabled);

        Activity activity = this.cordova.getActivity();

        EventBus eventBus = EventBus.getDefault();
        synchronized(eventBus) {
            if (eventBus.isRegistered(this)) {
                eventBus.unregister(this);
            }
        }
        if(isEnabled && stopOnTerminate) {
            this.cordova.getActivity().stopService(backgroundServiceIntent);
        }
    }
}
