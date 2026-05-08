import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';

const TRACKER_HOST = 'https://tracker.transistorsoft.com';

@Component({
  selector: 'app-registration',
  templateUrl: 'registration.page.html',
  styleUrls: ['registration.page.scss'],
  standalone: false,
})
export class RegistrationPage implements OnInit {
  organization = '';
  username = '';
  loading = false;
  ready = false;

  constructor(private router: Router, private zone: NgZone) {
    this.organization = localStorage.getItem('transistor_org') || '';
    this.username = localStorage.getItem('transistor_username') || '';
  }

  ngOnInit() {
    if ((window as any).BackgroundGeolocation) {
      this.ready = true;
    } else {
      document.addEventListener('deviceready', () => {
        this.zone.run(() => this.ready = true);
      }, false);
    }
  }

  get canRegister(): boolean {
    return this.ready && !!this.organization.trim() && !!this.username.trim() && !this.loading;
  }

  get trackerUrl(): string {
    return `${TRACKER_HOST}/${this.organization || 'organization'}`;
  }

  async onRegister() {
    this.loading = true;

    try {
      const bg = (window as any).BackgroundGeolocation;

      await bg.destroyTransistorAuthorizationToken(TRACKER_HOST);
      const token = await bg.findOrCreateTransistorAuthorizationToken(
        this.organization.trim(),
        this.username.trim()
      );

      localStorage.setItem('transistor_registered', 'true');
      localStorage.setItem('transistor_org', this.organization.trim());
      localStorage.setItem('transistor_username', this.username.trim());

      await bg.setConfig({ transistorAuthorizationToken: token });

      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (error: any) {
      console.error('[registration] error:', error);
      alert('Registration failed: ' + (error?.message || JSON.stringify(error)));
    } finally {
      this.loading = false;
    }
  }
}
