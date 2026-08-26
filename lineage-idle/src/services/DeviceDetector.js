/**
 * DeviceDetector - Lineage Idle Native Device Type Detection (Mobile, Tablet, Desktop)
 */
export class DeviceDetector {
  constructor() {
    this.currentDevice = 'desktop';
    this.listeners = [];
    this.detect();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.handleResize(), { passive: true });
      window.addEventListener('orientationchange', () => this.handleResize(), { passive: true });
    }
  }

  static getInstance() {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }

  detect() {
    if (typeof window === 'undefined') return 'desktop';

    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTabletUA = /iPad|Tablet|(Android(?!.*Mobile))/i.test(ua);
    const width = window.innerWidth;

    if (width <= 768 || (isMobileUA && width <= 900)) {
      this.currentDevice = 'mobile';
    } else if ((width > 768 && width <= 1024) || isTabletUA) {
      this.currentDevice = 'tablet';
    } else {
      this.currentDevice = 'desktop';
    }

    this.applyClasses();
    return this.currentDevice;
  }

  getDeviceType() {
    return this.currentDevice;
  }

  isMobile() {
    return this.currentDevice === 'mobile';
  }

  isTablet() {
    return this.currentDevice === 'tablet';
  }

  isDesktop() {
    return this.currentDevice === 'desktop';
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  handleResize() {
    const prev = this.currentDevice;
    const next = this.detect();
    if (prev !== next) {
      this.listeners.forEach(fn => fn(next));
    }
  }

  applyClasses(targetElement) {
    if (typeof document === 'undefined') return;

    const root = targetElement || document.getElementById('game') || document.body;
    if (root) {
      root.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
      root.classList.add(`device-${this.currentDevice}`);
    }
    if (document.body) {
      document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
      document.body.classList.add(`device-${this.currentDevice}`);
    }
  }
}

if (typeof window !== 'undefined') {
  window.DeviceDetector = DeviceDetector.getInstance();
}

export const deviceDetector = DeviceDetector.getInstance();
