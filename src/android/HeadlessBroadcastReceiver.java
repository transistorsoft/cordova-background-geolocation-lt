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

            HeadlessTask.invoke(context.getApplicationContext(), eventName, event, new CompletionHandler());
        } catch (JSONException e) {
            TSLog.logger.error(TSLog.error(e.getMessage()));
            e.printStackTrace();
        }
    }

    class CompletionHandler implements HeadlessTask.Callback {
        public void finish() {
            // Do nothing with BroadcastReceiver.
        }
    }
}
