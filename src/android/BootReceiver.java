package com.transistorsoft.cordova.bggeo;
import com.transistorsoft.locationmanager.*;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

/**
 * This boot receiver is meant to handle the case where device is first booted after power up.  
 * This boot the headless BackgroundGeolocationService as configured by this class.
 * @author chris scott
 *
 */
public class BootReceiver extends BroadcastReceiver {   
    private static final String TAG = "TSLocationManager";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Settings.init(context.getSharedPreferences(TAG, 0));
        Settings.load();

        boolean startOnBoot     = Settings.getStartOnBoot();
        boolean enabled         = Settings.getEnabled();

        if (!startOnBoot || !enabled) {
            return;
        }
        Log.i(TAG, "BootReceiver booting service");
        // Start the service.
        Intent launchIntent = new Intent(context, BackgroundGeolocationService.class);
        Bundle event = new Bundle();
        event.putString("command", BackgroundGeolocationService.ACTION_START_ON_BOOT);
        launchIntent.putExtras(event);
        context.startService(launchIntent);
    }
}

