document.addEventListener('deviceready', onDeviceReady, false);

var bg = null;

// UI refs
var ui = {};

function $(id) { return document.getElementById(id); }

function onDeviceReady() {
  bg = window.BackgroundGeolocation;

  ui = {
    toggleTracking:   $('toggle-tracking'),
    trackingSublabel: $('tracking-sublabel'),
    btnPace:          $('btn-pace'),
    paceIcon:         $('pace-icon'),
    motionLabel:      $('motion-label'),
    providerIndicator:$('provider-indicator'),
    providerStatus:   $('provider-status'),
    activityIcon:     $('activity-icon'),
    activityName:     $('activity-name'),
    odometerValue:    $('odometer-value'),
    locationCard:     $('location-card'),
    locLat:           $('loc-lat'),
    locLng:           $('loc-lng'),
    locSpeed:         $('loc-speed'),
    locAccuracy:      $('loc-accuracy'),
    btnCurrentPos:    $('btn-current-position'),
    btnMenu:          $('btn-menu'),
    menuOverlay:      $('menu-overlay'),
    btnMenuClose:     $('btn-menu-close'),
    alertOverlay:     $('alert-overlay'),
    alertTitle:       $('alert-title'),
    alertBody:        $('alert-body'),
    btnAlertClose:    $('btn-alert-close'),
    emailOverlay:     $('email-overlay'),
    emailInput:       $('email-input'),
    btnEmailCancel:   $('btn-email-cancel'),
    btnEmailSend:     $('btn-email-send')
  };

  bindEvents();
  initBackgroundGeolocation();
}

// ── Event Binding ──

function bindEvents() {
  ui.toggleTracking.addEventListener('change', onToggleTracking);
  ui.btnPace.addEventListener('click', onTogglePace);
  ui.btnCurrentPos.addEventListener('click', onGetCurrentPosition);

  ui.btnMenu.addEventListener('click', function() { showOverlay(ui.menuOverlay); });
  ui.btnMenuClose.addEventListener('click', function() { hideOverlay(ui.menuOverlay); });
  ui.menuOverlay.addEventListener('click', function(e) {
    if (e.target === ui.menuOverlay) hideOverlay(ui.menuOverlay);
  });

  ui.btnAlertClose.addEventListener('click', function() { hideOverlay(ui.alertOverlay); });
  ui.alertOverlay.addEventListener('click', function(e) {
    if (e.target === ui.alertOverlay) hideOverlay(ui.alertOverlay);
  });

  ui.btnEmailCancel.addEventListener('click', function() { hideOverlay(ui.emailOverlay); });
  ui.btnEmailSend.addEventListener('click', onEmailLogSend);

  document.querySelectorAll('.menu-item[data-action]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var action = this.getAttribute('data-action');
      hideOverlay(ui.menuOverlay);
      setTimeout(function() { onMenuAction(action); }, 200);
    });
  });
}

// ── BackgroundGeolocation Init ──

function initBackgroundGeolocation() {
  bg.onLocation(onLocation, onLocationError);
  bg.onMotionChange(onMotionChange);
  bg.onActivityChange(onActivityChange);
  bg.onProviderChange(onProviderChange);
  bg.onGeofence(onGeofence);

  bg.ready({
    desiredAccuracy: bg.DESIRED_ACCURACY_HIGH,
    distanceFilter: 10,
    stopTimeout: 5,
    debug: true,
    logLevel: bg.LOG_LEVEL_VERBOSE,
    stopOnTerminate: false,
    startOnBoot: true,
    enableHeadless: true,
    heartbeatInterval: 60,
    autoSync: true
  }, function(state) {
    console.log('[ready] state:', JSON.stringify(state, null, 2));
    ui.toggleTracking.checked = state.enabled;
    updateTrackingUI(state.enabled);
    updateOdometer(state.odometer || 0);
  }, function(error) {
    console.warn('[ready] error:', error);
  });
}

// ── Location Events ──

function onLocation(location) {
  console.log('[location]', JSON.stringify(location));
  updateLocationCard(location);
  updateOdometer(location.odometer);
}

function onLocationError(error) {
  console.warn('[location] error:', error);
}

function onMotionChange(event) {
  console.log('[motionchange]', JSON.stringify(event));
  updateMotionUI(event.isMoving);
  updateLocationCard(event.location);
}

function onActivityChange(event) {
  console.log('[activitychange]', JSON.stringify(event));
  updateActivity(event.activity);
}

function onProviderChange(event) {
  console.log('[providerchange]', JSON.stringify(event));
  updateProvider(event.enabled);
}

function onGeofence(event) {
  console.log('[geofence]', JSON.stringify(event));
}

// ── UI Actions ──

function onToggleTracking() {
  var enabled = ui.toggleTracking.checked;
  updateTrackingUI(enabled);
  if (enabled) {
    bg.start(function(state) {
      console.log('[start] success:', JSON.stringify(state));
    });
  } else {
    bg.stop(function(state) {
      console.log('[stop] success:', JSON.stringify(state));
      updateMotionUI(false);
    });
  }
}

function onTogglePace() {
  var el = ui.btnPace;
  var isMoving = el.classList.contains('stationary');
  bg.changePace(isMoving, function() {
    updateMotionUI(isMoving);
  });
}

function onGetCurrentPosition() {
  bg.getCurrentPosition({
    extras: { getCurrentPosition: true }
  }, function(location) {
    console.log('[getCurrentPosition]', JSON.stringify(location));
    updateLocationCard(location);
    updateOdometer(location.odometer);
  }, function(error) {
    console.warn('[getCurrentPosition] error:', error);
    showAlert('Error', 'getCurrentPosition failed:\n' + error);
  });
}

// ── Menu Actions ──

function onMenuAction(action) {
  switch (action) {
    case 'requestPermission':
      bg.requestPermission(
        function(status) { showAlert('Permission', 'Authorization status: ' + status); },
        function(error) { showAlert('Permission Error', JSON.stringify(error, null, 2)); }
      );
      break;
    case 'resetOdometer':
      bg.resetOdometer(function(location) {
        updateOdometer(0);
        showAlert('Odometer', 'Odometer reset');
      });
      break;
    case 'sync':
      bg.getCount(function(count) {
        if (!count) {
          showAlert('Sync', 'Database is empty.');
          return;
        }
        bg.sync(
          function(records) { showAlert('Sync', 'Synced ' + records.length + ' locations.'); },
          function(error) { showAlert('Sync Error', JSON.stringify(error, null, 2)); }
        );
      });
      break;
    case 'getState':
      bg.getState(function(state) {
        showAlert('State', JSON.stringify(state, null, 2));
      });
      break;
    case 'emailLog':
      ui.emailInput.value = localStorage.getItem('emailLog') || '';
      showOverlay(ui.emailOverlay);
      break;
    case 'destroyLog':
      bg.logger.destroyLog(function() { showAlert('Log', 'Log destroyed.'); });
      break;
    case 'destroyLocations':
      bg.destroyLocations(function() {
        showAlert('Locations', 'All locations destroyed.');
      });
      break;
  }
}

function onEmailLogSend() {
  var email = ui.emailInput.value.trim();
  if (!email) return;
  localStorage.setItem('emailLog', email);
  hideOverlay(ui.emailOverlay);
  bg.logger.emailLog(email, function() {
    console.log('[emailLog] success');
  });
}

// ── UI Updates ──

function updateTrackingUI(enabled) {
  ui.trackingSublabel.textContent = enabled
    ? 'Location updates active'
    : 'Location updates paused';
}

function updateMotionUI(isMoving) {
  if (isMoving) {
    ui.btnPace.classList.remove('stationary');
    ui.btnPace.classList.add('moving');
    ui.paceIcon.innerHTML = '&#10074;&#10074;';
    ui.motionLabel.textContent = 'Moving';
  } else {
    ui.btnPace.classList.remove('moving');
    ui.btnPace.classList.add('stationary');
    ui.paceIcon.innerHTML = '&#9654;';
    ui.motionLabel.textContent = 'Stationary';
  }
}

function updateLocationCard(location) {
  if (!location || !location.coords) return;
  ui.locationCard.style.display = '';
  ui.locLat.textContent = location.coords.latitude.toFixed(6);
  ui.locLng.textContent = location.coords.longitude.toFixed(6);
  ui.locSpeed.textContent = (location.coords.speed || 0).toFixed(1) + ' m/s';
  ui.locAccuracy.textContent = (location.coords.accuracy || 0).toFixed(0) + ' m';
}

function updateOdometer(meters) {
  ui.odometerValue.textContent = (meters / 1000).toFixed(2) + ' km';
}

var ACTIVITY_ICONS = {
  'still':       '🧍',
  'on_foot':     '🚶',
  'walking':     '🚶',
  'running':     '🏃',
  'on_bicycle':  '🚴',
  'in_vehicle':  '🚗',
  'unknown':     '❓'
};

function updateActivity(activity) {
  ui.activityIcon.textContent = ACTIVITY_ICONS[activity] || '❓';
  ui.activityName.textContent = activity || 'unknown';
}

function updateProvider(enabled) {
  if (enabled) {
    ui.providerIndicator.classList.remove('off');
    ui.providerIndicator.classList.add('on');
    ui.providerStatus.textContent = 'Enabled';
  } else {
    ui.providerIndicator.classList.remove('on');
    ui.providerIndicator.classList.add('off');
    ui.providerStatus.textContent = 'Disabled';
  }
}

// ── Modals ──

function showOverlay(el) { el.classList.remove('hidden'); }
function hideOverlay(el) { el.classList.add('hidden'); }

function showAlert(title, body) {
  ui.alertTitle.textContent = title;
  ui.alertBody.textContent = body;
  showOverlay(ui.alertOverlay);
}
