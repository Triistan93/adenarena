import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

globalThis.window = globalThis;
await import('../lineage-idle/data/echo-adapter.js');
const { isSkillAvailableForCharacter, isSkillNativeOrAvailableNow } = await import('../lineage-idle/src/services/SkillEligibility.js');
const { spendSP } = await import('../lineage-idle/src/engine/SkillEngine.js');
const { CANONICAL_CLASS_REGISTRY_V2 } = await import('../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js');
const { CANONICAL_SKILL_REGISTRY_V2 } = await import('../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js');

// Load generated LOT C manifests
const thirdJobManifest = JSON.parse(fs.readFileSync('scraped_data_wiki/third_job_class_manifest.json', 'utf8'));
const lv76Manifest = JSON.parse(fs.readFileSync('scraped_data_wiki/lv76_plus_canonical_manifest.json', 'utf8'));
const legendary4StarManifest = JSON.parse(fs.readFileSync('scraped_data_wiki/legendary_4star_skill_manifest.json', 'utf8'));
const heroicManifest = JSON.parse(fs.readFileSync('scraped_data_wiki/heroic_skill_manifest.json', 'utf8'));
const superiorInvestigation = JSON.parse(fs.readFileSync('scraped_data_wiki/superior_skill_investigation.json', 'utf8'));

// ─── 1. Third Job Graph Integrity Invariants ─────────────────────────────────
test('1. Third Job Graph Integrity: Exactly 49 S3 nodes discovered with ancestry', () => {
  assert.equal(thirdJobManifest.length, 49, 'Third job nodes must equal 49 (not historical 46 constant)');
  for (const job of thirdJobManifest) {
    assert.equal(job.stage, 3, `Class ${job.classId} must be stage 3`);
    assert.equal(job.minimumPromotionLevel, 76, `Class ${job.classId} must have minimumPromotionLevel 76`);
    assert.ok(job.ancestry, `Class ${job.classId} must have ancestry trace`);
    assert.ok(job.sourceEvidence, `Class ${job.classId} must have documentary evidence`);
  }
});

// ─── 2. Lv 76+ Manifest Record Invariants ────────────────────────────────────
test('2. Lv76+ Manifest Integrity: 1514 records, 697 unique IDs, source evidence on every record', () => {
  assert.equal(lv76Manifest.length, 1514, 'Total Lv76+ records must equal 1514');
  const uniqueIds = new Set(lv76Manifest.map(m => m.wikiSkillId));
  assert.equal(uniqueIds.size, 697, 'Unique wikiSkillIds must equal 697');

  for (const m of lv76Manifest) {
    assert.ok(m.wikiSkillId, 'Record must have wikiSkillId');
    assert.ok(m.name, 'Record must have name');
    assert.ok(m.minLevel >= 76, `Record ${m.name} must have minLevel >= 76`);
    assert.ok(Array.isArray(m.evidence) && m.evidence.length > 0, `Record ${m.name} must have evidence array`);
    assert.ok(['76', '77-79', '80-89', '90+'].includes(m.levelBucket), `Valid levelBucket for ${m.name}`);
    assert.ok(['OWN', 'INHERITED', 'SHARED', 'UNKNOWN'].includes(m.provenance), `Valid provenance for ${m.name}`);
  }
});

// ─── 3. Proven Book Evidence Invariant ────────────────────────────────────────
test('3. Proven Book Evidence: Every PROVEN book mapping has explicit coupon/item evidence', () => {
  const provenBooks = lv76Manifest.filter(m => m.book?.status === 'PROVEN');
  assert.ok(provenBooks.length > 0, 'Must have proven book records');

  for (const m of provenBooks) {
    assert.ok(m.book.itemId, `Proven book ${m.name} must declare itemId`);
    assert.ok(m.book.tier, `Proven book ${m.name} must declare tier`);
    assert.ok(m.book.stars, `Proven book ${m.name} must declare stars`);
    assert.ok(m.book.couponItemId, `Proven book ${m.name} must link to source couponItemId`);
  }
});

// ─── 4. Explicit Legendary 4★ Evidence Invariant ──────────────────────────────
test('4. 4★ Record Invariant: Every 4★ record has explicit Legendary/Coupon 103041 evidence', () => {
  for (const l of legendary4StarManifest) {
    assert.equal(l.stars, 4);
    assert.equal(l.tier, 'Legendary');
    assert.equal(l.couponItemId, '103041');
    assert.equal(l.status, 'PROVEN');
  }
  // Negative control: Hellfire must NOT be in legendary4StarManifest
  const hellfireIn4Star = legendary4StarManifest.find(l => l.name.toLowerCase().includes('hellfire'));
  assert.equal(hellfireIn4Star, undefined, 'Hellfire must NEVER be classified as proven 4★ book');
});

// ─── 5. No minLevel -> Book or Grade Inference ────────────────────────────────
test('5. Epistemic Discipline: minLevel >= 76 does NOT infer book_4star or Legendary grade', () => {
  const unprovenLv76 = lv76Manifest.filter(m => m.book?.status === 'UNPROVEN');
  assert.ok(unprovenLv76.length > 0, 'Unproven books must remain UNPROVEN');

  // Verify that records with minLevel: 76 do not automatically get book_4star
  const unmapped76 = unprovenLv76.find(m => m.minLevel === 76 && m.book?.itemId === null);
  assert.ok(unmapped76, 'Found Lv 76 skills with null book requirement (no fake book_4star inference)');
  assert.equal(unmapped76.book.required, null, 'UNKNOWN book must NOT be converted to false or true');
});

// ─── 6. No S0/S1/S2 Bypass into S3 Skill ─────────────────────────────────────
test('6. Progression Invariant: S0/S1/S2 classes at Lv 76 are rejected for S3 skills', () => {
  const charS0_Lv76 = { class: 'deathPilgrim', race: 'human', level: 76, skills: {}, sp: 1000 };
  const charS1_Lv76 = { class: 'deathBlade', race: 'human', level: 76, skills: {}, sp: 1000 };
  const charS2_Lv76 = { class: 'deathKnightStage2', race: 'human', level: 76, skills: {}, sp: 1000 };
  const charS3_Lv76 = { class: 'deathKnight', race: 'human', level: 76, skills: {}, sp: 1000 };

  const hellfireDef = window.EchoData.SKILL_DEFS_ECHO['hellfire'];
  assert.ok(hellfireDef, 'Hellfire def must exist in SKILL_DEFS_ECHO');

  // Stages 0, 1, 2 must be strictly rejected
  assert.equal(isSkillNativeOrAvailableNow('deathPilgrim', hellfireDef), false);
  assert.equal(isSkillNativeOrAvailableNow('deathBlade', hellfireDef), false);
  assert.equal(isSkillNativeOrAvailableNow('deathKnightStage2', hellfireDef), false);

  // Stage 3 at Lv 76 passes stage eligibility
  assert.equal(isSkillNativeOrAvailableNow('deathKnight', hellfireDef), true);
  assert.equal(isSkillAvailableForCharacter(charS3_Lv76, hellfireDef), true);
});

// ─── 7. Superior Investigation Invariant ──────────────────────────────────────
test('7. Superior Invariant: Superior is confirmed as Doll Grade, NOT a skill grade or spellbook', () => {
  assert.equal(superiorInvestigation.investigationQuestions.A.answer, false);
  assert.equal(superiorInvestigation.investigationQuestions.B.answer, false);
  assert.equal(superiorInvestigation.investigationQuestions.C.answer, false);
  assert.equal(superiorInvestigation.investigationQuestions.E.answer, 'DOLL_GRADE');
  assert.equal(superiorInvestigation.findings.superiorOccurrencesCount, 0);
  assert.equal(superiorInvestigation.findings.bookEvidence, null);
});

// ─── 8. Heroic Invariant: HEROIC !== RARE and links to Coupon 100053 ──────────
test('8. Heroic Invariant: Heroic is decoupled from Rare and documented with Coupon 100053', () => {
  assert.equal(heroicManifest.couponItemId, '100053');
  assert.equal(heroicManifest.tier, 'Heroic');
  assert.notEqual(heroicManifest.tier, 'Rare');
  assert.ok(heroicManifest.sampleHeroicSkills.length > 0);
});

// ─── 9. Legendary Archer Golden Fixture (Positive Control) ───────────────────
test('9. Golden Fixture: Legendary Archer requires 4★ book at Lv 76 and operates atomically', () => {
  const sagDef = window.EchoData.SKILL_DEFS_ECHO['legendary_archer'];
  assert.ok(sagDef, 'Legendary Archer def must exist');
  assert.equal(sagDef.reqLvl, 76, 'Legendary Archer requires Lv 76');
  assert.equal(sagDef.starRank, 4, 'Legendary Archer is 4★');
  assert.equal(sagDef.requiredItemToUnlock, 'book_4star', 'Requires book_4star');

  // Sagittarius Lv 76 with book_4star unlocks atomically
  const stateSuccess = {
    class: 'sagittarius',
    race: 'human',
    level: 76,
    sp: 1000,
    skills: {},
    inventory: [{ uid: 'b4', itemId: 'book_4star', count: 1 }]
  };
  assert.equal(spendSP(stateSuccess, 'legendary_archer'), true);
  assert.equal(stateSuccess.skills['legendary_archer'], 1);
  const remainingBook = stateSuccess.inventory.find(i => i.itemId === 'book_4star');
  assert.equal(remainingBook ? remainingBook.count : 0, 0, 'book_4star consumed');
});

// ─── 10. Hellfire Fixture (Negative Control) ──────────────────────────────────
test('10. Negative Control: Hellfire is Lv 76 S3 Death Knight with book requirement strictly UNPROVEN', () => {
  const hf = lv76Manifest.find(m => m.name.toLowerCase().trim() === 'hellfire');
  assert.ok(hf, 'Hellfire must exist in Lv76 manifest');
  assert.equal(hf.minLevel, 76);
  assert.equal(hf.book.status, 'UNPROVEN');
  assert.equal(hf.book.itemId, null);
  assert.equal(hf.book.required, null);
});
