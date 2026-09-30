import CLASS_PORTRAITS_BY_RACE from './generatedClassPortraits.json';

export const HERO_IMAGES: Record<string, string> = {};
export const CLASS_PORTRAITS = CLASS_PORTRAITS_BY_RACE;

// Expose to the vanilla JS art module running inside the shadow DOM
if (typeof window !== 'undefined') {
  (window as any).__HERO_IMGS = HERO_IMAGES;
  (window as any).__CLASS_PORTRAITS = CLASS_PORTRAITS;
}
