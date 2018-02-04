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

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import static android.content.Context.NOTIFICATION_SERVICE;

/**
 * Plumbing for BackgroundGeolocationHeadlessTask
 */

public class HeadlessTask {
    private Callback mCompletionHandler;
    private static String BACKGROUND_GEOLOCATION_HEADLESS_TASK = HeadlessTask.class.getPackage().getName() + ".BackgroundGeolocationHeadlessTask";
    private static String METHOD_SET_COMPLETION_HANDLER = "setCompletionHandler";
    private static String METHOD_ON_RECEIVE             = "onReceive";

    public static boolean invoke(Context context, String event, JSONObject params, HeadlessTask.Callback completionHandler) {
        try {
            // Get class BackgroundGeolocationTask
            Class<?> CustomHeadlessClass = Class.forName(BACKGROUND_GEOLOCATION_HEADLESS_TASK);
            Constructor<?> cons = CustomHeadlessClass.getConstructor();
            Object headlessTask = cons.newInstance();
            // Get method #setCompletionHandler
            Method setCompletionHandler = headlessTask.getClass().getMethod(METHOD_SET_COMPLETION_HANDLER, completionHandler.getClass());
            setCompletionHandler.invoke(headlessTask, completionHandler);
            // Get method #onReceive
            Class<?>[] paramTypes = {Context.class, String.class, JSONObject.class};
            Method onReceive = headlessTask.getClass().getMethod(METHOD_ON_RECEIVE, paramTypes);
            onReceive.invoke(headlessTask, context, event, params);
            return true;
        } catch (ClassNotFoundException e) {
            TSLog.logger.error("HeadlessTask failed to find BackgroundGeolocationHeadlessTask.java.  If you've configured enableHeadless: true, you must provide a custom BackgroundGeolocationHeadlessTask.java.  See Wiki: https://github.com/transistorsoft/cordova-background-geolocation-lt/wiki/Android-Headless-Mode");
            handleReflectionError(context, e);
            return false;
        } catch (NoSuchMethodException e) {
            handleReflectionError(context, e);
            return false;
        } catch (IllegalAccessException e) {
            handleReflectionError(context, e);
            return false;
        } catch (InstantiationException e) {
            handleReflectionError(context, e);
            return false;
        } catch (InvocationTargetException e) {
            handleReflectionError(context, e);
            return false;
        }
    }

    private static void handleReflectionError(Context context, Exception e) {
        com.transistorsoft.locationmanager.settings.Settings.load(context);
        com.transistorsoft.locationmanager.settings.Settings.enableHeadless = false;
        TSLog.logger.error(TSLog.error("BackgroundGeolocationHeadlessTask exception: " + e.getMessage()));
        TSLog.logger.error(TSLog.error("enableHeadless has been automatically disabled."));
        e.printStackTrace();
    }

    public void setCompletionHandler(HeadlessJobService.CompletionHandler completionHandler) {
        applyCompletionHandler(completionHandler);
    }

    public void setCompletionHandler(HeadlessBroadcastReceiver.CompletionHandler completionHandler) {
        applyCompletionHandler(completionHandler);
    }

    private void applyCompletionHandler(Callback completionHandler) {
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

