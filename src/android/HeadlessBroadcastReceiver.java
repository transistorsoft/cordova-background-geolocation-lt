package com.transistorsoft.cordova.bggeo;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import com.transistorsoft.locationmanager.logger.TSLog;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by chris on 2018-01-24.
 */

public class HeadlessBroadcastReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle extras = intent.getExtras();

        try {
            String eventName = extras.getString("event");
            TSLog.logger.debug("\uD83D\uDC80  event: " + eventName);

            JSONObject event = new JSONObject(extras.getString("params"));

            BackgroundGeolocationHeadlessTask headlessTask = new BackgroundGeolocationHeadlessTask();
            headlessTask.setCompletionHandler(new HeadlessTask.Callback() {
                @Override
                public void finish() {
                    // Do nothing with BroadcastReceiver.  This is only for JobService
                }
            });

            headlessTask.onReceive(context, eventName, event);
        } catch (JSONException e) {
            TSLog.logger.error(TSLog.error(e.getMessage()));
            e.printStackTrace();
        }
    }
}
