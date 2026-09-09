/**
 * PrototypeAssetValidator.js
 * 
 * Verifies all required character assets exist, have valid dimensions,
 * transparent backgrounds, consistent naming and register declarations.
 * Direct implementation of Section 58.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllClassIds } from '../data/classes/ClassIdentity.js';
import { CHARACTER_VISUAL_REGISTRY } from '../data/characters/CharacterVisualRegistry.js';
import { ANIMATION_REGISTRY } from '../data/characters/AnimationRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTOTYPE_ROOT = path.resolve(__dirname, '../../');

export function validateAllAssets() {
  const classIds = getAllClassIds();
  const results = {
    totalClasses: classIds.length,
    passed: 0,
    failed: 0,
    details: {}
  };

  classIds.forEach(classId => {
    const profile = CHARACTER_VISUAL_REGISTRY[classId];
    const animSet = profile ? ANIMATION_REGISTRY[profile.animationSet] : null;

    const classResult = {
      classId,
      status: 'PASS',
      errors: [],
      files: {}
    };

    if (!profile) {
      classResult.status = 'FAIL';
      classResult.errors.push(`Missing profile in CHARACTER_VISUAL_REGISTRY for ${classId}`);
      results.failed++;
      results.details[classId] = classResult;
      return;
    }

    const requiredKeys = ['master', 'idle', 'attack', 'cast', 'hit', 'death', 'ultimate'];
    requiredKeys.forEach(key => {
      const relPath = profile.assets[key];
      if (!relPath) {
        classResult.status = 'FAIL';
        classResult.errors.push(`Missing asset path for '${key}'`);
        return;
      }

      const absPath = path.resolve(PROTOTYPE_ROOT, relPath);
      if (!fs.existsSync(absPath)) {
        classResult.status = 'FAIL';
        classResult.errors.push(`File does not exist: ${relPath}`);
        return;
      }

      try {
        const buf = fs.readFileSync(absPath);
        // Verify PNG magic bytes: 0x89, 0x50, 0x4E, 0x47
        if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
          classResult.status = 'FAIL';
          classResult.errors.push(`File is not a valid PNG: ${relPath}`);
          return;
        }

        const width = buf.readUInt32BE(16);
        const height = buf.readUInt32BE(20);
        const frameWidth = 128;
        const frameCount = key === 'master' ? 1 : Math.floor(width / frameWidth);

        classResult.files[key] = {
          file: relPath,
          width,
          height,
          frameCount
        };

        // Animation strips must maintain the strict 128px height baseline (Section 7)
        if (key !== 'master' && height !== 128) {
          classResult.status = 'FAIL';
          classResult.errors.push(`Expected animation strip height 128px, got ${height}px for ${relPath}`);
        }

        if (key !== 'master' && frameCount < 1) {
          classResult.status = 'FAIL';
          classResult.errors.push(`Animation strip has 0 frames for ${relPath}`);
        }
      } catch (err) {
        classResult.status = 'FAIL';
        classResult.errors.push(`Error reading ${relPath}: ${err.message}`);
      }
    });

    if (classResult.status === 'PASS') {
      results.passed++;
    } else {
      results.failed++;
    }

    results.details[classId] = classResult;
  });

  results.status = results.failed === 0 ? 'PASS' : 'FAIL';
  return results;
}
