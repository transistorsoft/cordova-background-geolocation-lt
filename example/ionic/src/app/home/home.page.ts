import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import BackgroundGeolocation from 'cordova-background-geolocation-lt';
import type {
  State,
  Location,
  MotionChangeEvent,
  MotionActivityEvent,
  ProviderChangeEvent,
  GeofenceEvent
} from '@transistorsoft/background-geolocation-types';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  enabled = false;
  isMoving = false;
  odometer = '0.00';

  providerEnabled = false;
  activityIcon = '';
  activityName = 'unknown';

  location: Location | null = null;

  private bg = BackgroundGeolocation;

  constructor(private router: Router, private zone: NgZone) {}

  ngOnInit() {
    document.addEventListener('deviceready', () => this.initBackgroundGeolocation(), false);
  }

  ngOnDestroy() {
    this.bg.removeListeners();
  }

  private async initBackgroundGeolocation() {
    this.bg.onLocation((location: Location) => this.zone.run(() => this.onLocation(location)));
    this.bg.onMotionChange((event: MotionChangeEvent) => this.zone.run(() => this.onMotionChange(event)));
    this.bg.onActivityChange((event: MotionActivityEvent) => this.zone.run(() => this.onActivityChange(event)));
    this.bg.onProviderChange((event: ProviderChangeEvent) => this.zone.run(() => this.onProviderChange(event)));
    this.bg.onGeofence((event: GeofenceEvent) => this.onGeofence(event));

    const org = localStorage.getItem('transistor_org') || '';
    const username = localStorage.getItem('transistor_username') || '';
    const token = await this.bg.findOrCreateTransistorAuthorizationToken(org, username);

    this.bg.ready({
      transistorAuthorizationToken: token,
      desiredAccuracy: this.bg.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopTimeout: 5,
      debug: true,
      logLevel: this.bg.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      heartbeatInterval: 60,
      autoSync: true
    }).then((state: State) => {
      console.log('[ready] state:', state);
      this.zone.run(() => {
        this.enabled = state.enabled;
        this.odometer = ((state.odometer || 0) / 1000).toFixed(2);
      });
    }).catch((error: any) => {
      console.warn('[ready] error:', error);
    });
  }

  // Event handlers
  private onLocation(location: Location) {
    console.log('[location]', location);
    this.location = location;
    this.odometer = (location.odometer / 1000).toFixed(2);
  }

  private onMotionChange(event: MotionChangeEvent) {
    console.log('[motionchange]', event);
    this.isMoving = event.isMoving;
    this.location = event.location;
  }

  private onActivityChange(event: MotionActivityEvent) {
    console.log('[activitychange]', event);
    this.activityName = event.activity;
    const icons: Record<string, string> = {
      still: 'body-outline',
      on_foot: 'walk-outline',
      walking: 'walk-outline',
      running: 'fitness-outline',
      on_bicycle: 'bicycle-outline',
      in_vehicle: 'car-outline',
      unknown: 'help-outline'
    };
    this.activityIcon = icons[event.activity] || 'help-outline';
  }

  private onProviderChange(event: ProviderChangeEvent) {
    console.log('[providerchange]', event);
    this.providerEnabled = event.enabled;
  }

  private onGeofence(event: GeofenceEvent) {
    console.log('[geofence]', event);
  }

  // UI Actions
  onToggleTracking() {
    if (this.enabled) {
      this.bg.start().then((state: State) => {
        console.log('[start] success:', state);
      });
    } else {
      this.bg.stop().then((state: State) => {
        console.log('[stop] success:', state);
        this.zone.run(() => this.isMoving = false);
      });
    }
  }

  onTogglePace() {
    const newState = !this.isMoving;
    this.bg.changePace(newState).then(() => {
      this.zone.run(() => this.isMoving = newState);
    });
  }

  onGetCurrentPosition() {
    this.bg.getCurrentPosition({
      extras: { getCurrentPosition: true }
    }).then((location: Location) => {
      console.log('[getCurrentPosition]', location);
      this.zone.run(() => {
        this.location = location;
        this.odometer = (location.odometer / 1000).toFixed(2);
      });
    }).catch((error: any) => {
      console.warn('[getCurrentPosition] error:', error);
    });
  }

  onRequestPermission() {
    this.bg.requestPermission().then((status: number) => {
      alert('Authorization status: ' + status);
    }).catch((error: any) => {
      alert('Permission error: ' + JSON.stringify(error));
    });
  }

  onResetOdometer() {
    this.bg.resetOdometer().then(() => {
      this.zone.run(() => this.odometer = '0.00');
    });
  }

  onSync() {
    this.bg.getCount().then((count: number) => {
      if (!count) {
        alert('Database is empty.');
        return;
      }
      this.bg.sync().then((records: Location[]) => {
        alert('Synced ' + records.length + ' locations.');
      });
    });
  }

  onGetState() {
    this.bg.getState().then((state: State) => {
      alert(JSON.stringify(state, null, 2));
    });
  }

  onDestroyLog() {
    this.bg.logger.destroyLog().then(() => alert('Log destroyed.'));
  }

  onDestroyLocations() {
    this.bg.destroyLocations().then(() => alert('All locations destroyed.'));
  }

  onEmailLog() {
    const email = prompt('Email address:', localStorage.getItem('emailLog') || '');
    if (!email) return;
    localStorage.setItem('emailLog', email);
    this.bg.logger.emailLog(email);
  }

  onTransistorAuth() {
    this.router.navigate(['/registration']);
  }
}
