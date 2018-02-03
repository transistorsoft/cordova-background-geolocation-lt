package com.transistorsoft.cordova.bggeo;

import android.content.Context;
import org.json.JSONObject;

import com.transistorsoft.locationmanager.adapter.BackgroundGeolocation;
import com.transistorsoft.locationmanager.logger.TSLog;

/**
 * BackgroundGeolocationHeadlessTask
 * This component allows you to receive events from the BackgroundGeolocation plugin in the native Android environment while your app has been *terminated*,
 * where the plugin is configured for stopOnTerminate: false.  In this context, only the plugin's service is running.  This component will receive all the same
 * events you'd listen to in the Javascript API.
 *
 * You might use this component to:
 * - fetch / post information to your server (eg: request new API key)
 * - execute BackgroundGeolocation API methods (eg: #getCurrentPosition, #setConfig, #addGeofence, #stop, etc -- you can execute ANY method of the Javascript API)
 */

public class BackgroundGeolocationHeadlessTask extends HeadlessTask implements HeadlessTask.Receiver {
    /**
     * @param context
     * @param event [location|motionchange|providerchange|activitychange|http|heartbeat|geofence|schedule|boot|terminate
     * @param params Same params signtature provived to Javascript events.
     */
    @Override
    public void onReceive(Context context, String event, JSONObject params) {
        TSLog.logger.debug(TSLog.header("BackgroundGeolocationHeadlessTask: " + event));
        TSLog.logger.debug(params.toString());

        // You can get a reference to the BackgroundGeolocation native API like this:
        BackgroundGeolocation bgGeo = BackgroundGeolocation.getInstance(context);

        // Create custom logic based upon the received event
        if (event.equals(BackgroundGeolocation.EVENT_HEARTBEAT) || event.equals(BackgroundGeolocation.EVENT_TERMINATE)) {
            // Post a simple example notification to show we're alive.
            HeadlessTask.postNotification(context, event, params);
        }
        // Be sure to execute #finish when your task is complete.
        finish();
    }
}
