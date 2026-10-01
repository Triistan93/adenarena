export function selectPortraitSplit(opaquePixelsByColumn, { minRatio = 0.4, maxRatio = 0.6 } = {}) {
  if (!Array.isArray(opaquePixelsByColumn) || opaquePixelsByColumn.length < 2) {
    throw new TypeError('Portrait split requires per-column opacity counts.');
  }
  const width = opaquePixelsByColumn.length;
  const start = Math.max(1, Math.ceil(width * minRatio));
  const end = Math.min(width - 1, Math.floor(width * maxRatio));
  const center = width / 2;
  let best = null;

  for (let x = start; x <= end; x += 1) {
    const candidate = { x, opaque: opaquePixelsByColumn[x], offset: Math.abs(x - center) };
    if (!best
      || candidate.opaque < best.opaque
      || (candidate.opaque === best.opaque && candidate.offset < best.offset)
      || (candidate.opaque === best.opaque && candidate.offset === best.offset && candidate.x > best.x)) {
      best = candidate;
    }
  }

  return best.x;
}
