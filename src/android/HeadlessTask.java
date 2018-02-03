package com.transistorsoft.cordova.bggeo;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.support.v4.app.NotificationCompat;

import com.transistorsoft.locationmanager.adapter.BackgroundGeolocation;
import com.transistorsoft.locationmanager.logger.TSLog;

import org.json.JSONObject;

import static android.content.Context.NOTIFICATION_SERVICE;

/**
 * Plumbing for BackgroundGeolocationHeadlessTask
 */

public class HeadlessTask {
    private Callback mCompletionHandler;

    void setCompletionHandler(Callback completionHandler) {
        if (mCompletionHandler != null) { return; }
        mCompletionHandler = completionHandler;
    }

    protected void finish() {
        if (mCompletionHandler != null) {
            mCompletionHandler.finish();
            mCompletionHandler = null;
        }
    }

    /**
     * Example helper method to post a notification.
     * @param context
     * @param event
     * @param params
     */
    static void postNotification(Context context, String event, JSONObject params) {

        NotificationCompat.Builder builder;
        // Have to be careful with NotificationCompat.Builder with Android O
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // API 26 (requires appcompat:6+)
            try {
                builder = new NotificationCompat.Builder(context, context.getPackageName() + BackgroundGeolocation.TAG);
            } catch (NoSuchMethodError e) {
                builder = new NotificationCompat.Builder(context);
            }
        } else {
            builder = new NotificationCompat.Builder(context);
        }
        builder.setSmallIcon(context.getApplicationInfo().icon);
        builder.setPriority(NotificationCompat.PRIORITY_MAX);
        builder.setSound(Settings.System.DEFAULT_NOTIFICATION_URI);
        builder.setVibrate(new long[] { 1000, 1000});
        builder.setContentTitle("BackgroundGeolocationHeadlessTask: " + event);
        builder.setContentText(params.toString());

        String mainActivity = context.getPackageName() + ".MainActivity";
        try {
            // Clicking Notification opens app.
            PendingIntent contentIntent = PendingIntent.getActivity(context, 0,
                    new Intent(context, Class.forName(mainActivity)), PendingIntent.FLAG_UPDATE_CURRENT);
            builder.setContentIntent(contentIntent);
        } catch (ClassNotFoundException e) {
            TSLog.logger.warn(TSLog.warn("Attempted to attach contentIntent to Notification but failed to find class '" + mainActivity + "'"));
        }

        try {
            Uri sound = Settings.System.DEFAULT_NOTIFICATION_URI;
            Ringtone r = RingtoneManager.getRingtone(context, sound);
            r.play();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Sets an ID for the notification
        int mNotificationId = 001;
        // Gets an instance of the NotificationManager service
        NotificationManager mNotifyMgr =
                (NotificationManager) context.getSystemService(NOTIFICATION_SERVICE);
        // Builds the notification and issues it.
        mNotifyMgr.notify(mNotificationId, builder.build());
    }


    interface Receiver {
        void onReceive(Context context, String event, JSONObject params);
    }

    interface Callback {
        void finish();
    }
}

