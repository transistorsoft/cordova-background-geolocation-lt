// Re-export ALL shared types so consumers can do:
//   import BackgroundGeolocation, { Config, Location, GeofenceEvent } from 'cordova-background-geolocation-lt';
export * from '@transistorsoft/background-geolocation-types';

// Import the canonical BackgroundGeolocation interface from the shared types package.
import type { BackgroundGeolocation as SharedBackgroundGeolocation } from '@transistorsoft/background-geolocation-types';

// Declare the default export as the shared interface type.
declare const BackgroundGeolocation: SharedBackgroundGeolocation;
export default BackgroundGeolocation;
