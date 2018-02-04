package com.transistorsoft.cordova.bggeo;

/**
 * Created by chris on 2018-01-24.
 */

import android.annotation.TargetApi;
import android.app.job.JobParameters;
import android.app.job.JobService;
import android.os.PersistableBundle;

import com.transistorsoft.locationmanager.logger.TSLog;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by chris on 2018-01-17.
 */

@TargetApi(21)
public class HeadlessJobService extends JobService {

    @Override
    public boolean onStartJob(final JobParameters params) {
        PersistableBundle extras = params.getExtras();
        try {
            String eventName = extras.getString("event");
            TSLog.logger.debug("\uD83D\uDC80  event: " + eventName);

            JSONObject event = new JSONObject(extras.getString("params"));

            if (!HeadlessTask.invoke(getApplicationContext(), eventName, event, new CompletionHandler(params))) {
                jobFinished(params, false);
                return false;
            }
        } catch (JSONException e) {
            TSLog.logger.error(TSLog.error(e.getMessage()));
            jobFinished(params, false);
            e.printStackTrace();
        }
        return true;
    }
    @Override
    public boolean onStopJob(JobParameters params) {
        TSLog.logger.debug("HeadlessJobService onStopJob");
        jobFinished(params, false);
        return true;
    }

    class CompletionHandler implements HeadlessTask.Callback {
        private JobParameters mParams;
        public CompletionHandler(JobParameters params) {
            mParams = params;
        }
        public void finish() {
            jobFinished(mParams, false);
        }
    }
}
