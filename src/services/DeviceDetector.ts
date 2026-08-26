export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export class DeviceDetector {
  private static instance: DeviceDetector;
  private currentDevice: DeviceType = 'desktop';
  private listeners: Array<(device: DeviceType) => void> = [];

  private constructor() {
    this.detect();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize, { passive: true });
      window.addEventListener('orientationchange', this.handleResize, { passive: true });
    }
  }

  public static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }

  public detect(): DeviceType {
    if (typeof window === 'undefined') {
      return 'desktop';
    }

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

  public getDeviceType(): DeviceType {
    return this.currentDevice;
  }

  public isMobile(): boolean {
    return this.currentDevice === 'mobile';
  }

  public isTablet(): boolean {
    return this.currentDevice === 'tablet';
  }

  public isDesktop(): boolean {
    return this.currentDevice === 'desktop';
  }

  public subscribe(fn: (device: DeviceType) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private handleResize = () => {
    const prev = this.currentDevice;
    const next = this.detect();
    if (prev !== next) {
      this.listeners.forEach(fn => fn(next));
    }
  };

  public applyClasses(targetElement?: HTMLElement | null): void {
    if (typeof document === 'undefined') return;

    const root = targetElement || document.getElementById('game') || document.body;
    if (root) {
      root.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
      root.classList.add(`device-${this.currentDevice}`);
    }

    // Also attach to document body for global overlays
    if (document.body) {
      document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
      document.body.classList.add(`device-${this.currentDevice}`);
    }
  }
}

// Global exposure
if (typeof window !== 'undefined') {
  (window as any).DeviceDetector = DeviceDetector.getInstance();
}

export const deviceDetector = DeviceDetector.getInstance();
