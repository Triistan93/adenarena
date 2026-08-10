export const HERO_IMAGES: Record<string, string> = {};

// Expose to the vanilla JS art module running inside the shadow DOM
if (typeof window !== 'undefined') {
  (window as any).__HERO_IMGS = HERO_IMAGES;
}
