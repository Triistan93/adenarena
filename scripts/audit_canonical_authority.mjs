import fs from 'fs';
import crypto from 'crypto';

const rawTree = fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8');
const sha256Tree = crypto.createHash('sha256').update(rawTree).digest('hex');
const treeData = JSON.parse(rawTree);

console.log('=== CANONICAL JSON AUTHORITY AUDIT ===');
console.log('FILE: scraped_data_wiki/classes_tree_canonical.json');
console.log('SHA256:', sha256Tree);

let allNodes = new Map(); // id -> node
let allEdges = []; // { from, to, lineage }
let allLineages = new Set();
let stageCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
let terminalNodes = new Set();
let nonTerminalNodes = new Set();

const raceList = treeData;
console.log('\nTotal Races Found:', raceList.length);

for (const race of raceList) {
  const raceId = race.race;
  const raceName = race.raceName;
  const branches = race.branches || [];
  console.log(`- Race: [${raceId}] ("${raceName}") | Branches: ${branches.length}`);

  for (const branch of branches) {
    const lineageName = branch.lineageName;
    const role = branch.role;
    const thirdClassId = branch.third;
    allLineages.add(thirdClassId);

    const stages = [
      { id: branch.base, stage: 0 },
      { id: branch.first, stage: 1 },
      { id: branch.second, stage: 2 },
      { id: branch.third, stage: 3 }
    ];

    let prev = null;
    for (const step of stages) {
      const { id, stage } = step;
      if (!allNodes.has(id)) {
        allNodes.set(id, {
          id,
          race: raceId,
          raceName,
          stage,
          lineages: new Set([thirdClassId]),
          roles: new Set([role])
        });
      } else {
        const existing = allNodes.get(id);
        existing.lineages.add(thirdClassId);
        existing.roles.add(role);
      }

      if (prev) {
        allEdges.push({ from: prev, to: id, lineage: thirdClassId });
        nonTerminalNodes.add(prev);
      }
      prev = id;
    }
  }
}

// Unique edges
const uniqueEdgesMap = new Map();
for (const e of allEdges) {
  const key = `${e.from}->${e.to}`;
  if (!uniqueEdgesMap.has(key)) {
    uniqueEdgesMap.set(key, e);
  }
}

for (const [id, node] of allNodes.entries()) {
  stageCounts[node.stage]++;
  if (!nonTerminalNodes.has(id)) {
    terminalNodes.add(id);
  }
}

console.log('\n=== COMPUTED CANONICAL METRICS ===');
console.log('Races Count:', raceList.length);
console.log('Lineages Count (unique 3rd classes):', allLineages.size);
console.log('Total Unique Class Nodes:', allNodes.size);
console.log('Stage 0 (Base) Nodes:', stageCounts[0]);
console.log('Stage 1 (1st) Nodes:', stageCounts[1]);
console.log('Stage 2 (2nd) Nodes:', stageCounts[2]);
console.log('Stage 3 (3rd) Nodes:', stageCounts[3]);
console.log('Terminal Nodes Count (no children):', terminalNodes.size);
console.log('Total Graph Edges (unique transitions):', uniqueEdgesMap.size);

// Graph integrity
const inDegree = new Map();
const outDegree = new Map();
allNodes.forEach((_, id) => { inDegree.set(id, 0); outDegree.set(id, 0); });

for (const [_, e] of uniqueEdgesMap) {
  inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
  outDegree.set(e.from, (outDegree.get(e.from) || 0) + 1);
}

let multiParent = [];
let roots = [];
for (const [id, deg] of inDegree.entries()) {
  if (deg === 0) roots.push(id);
  if (deg > 1) multiParent.push({ id, deg });
}

console.log('\n=== DAG INTEGRITY CHECKS ===');
console.log('Root Nodes (inDegree = 0, must equal Stage 0):', roots.length);
console.log('Multi-Parent Nodes (inDegree > 1):', multiParent.length);

// Topo sort cycle test
const tempInDeg = new Map(inDegree);
const zeroQueue = [...roots];
let visited = 0;
while (zeroQueue.length > 0) {
  const u = zeroQueue.shift();
  visited++;
  for (const [_, e] of uniqueEdgesMap) {
    if (e.from === u) {
      const nextD = tempInDeg.get(e.to) - 1;
      tempInDeg.set(e.to, nextD);
      if (nextD === 0) zeroQueue.push(e.to);
    }
  }
}
console.log('Topological Sort Visited Nodes:', visited, '/', allNodes.size);
console.log('Has Cycle?:', visited !== allNodes.size ? 'YES (ERROR)' : 'NO (Valid DAG)');

// Check terminal vs stage 3 equivalence
let stage3Ids = new Set();
for (const [id, n] of allNodes) {
  if (n.stage === 3) stage3Ids.add(id);
}
let terminalDiff = 0;
for (const t of terminalNodes) {
  if (!stage3Ids.has(t)) terminalDiff++;
}
console.log('Are Terminal Nodes exactly the Stage 3 Nodes?:', terminalDiff === 0 && terminalNodes.size === stage3Ids.size ? 'YES' : 'NO');

// Cross-reference with classes_summary.json
if (fs.existsSync('scraped_data_wiki/classes_summary.json')) {
  const rawSummary = fs.readFileSync('scraped_data_wiki/classes_summary.json', 'utf8');
  const summaryData = JSON.parse(rawSummary);
  console.log('\n=== CROSS REFERENCE: classes_summary.json ===');
  console.log('Total entries in classes_summary.json:', summaryData.length);
  const summarySlugs = new Set(summaryData.map(c => c.slug));
  let matchedInSummary = 0;
  let missingInSummary = [];
  for (const id of allNodes.keys()) {
    if (summarySlugs.has(id)) matchedInSummary++;
    else missingInSummary.push(id);
  }
  console.log('Canonical tree nodes present in classes_summary.json:', matchedInSummary, '/', allNodes.size);
  console.log('Tree nodes NOT in classes_summary.json:', missingInSummary.length);
  if (missingInSummary.length > 0) {
    console.log('  Missing from classes_summary (e.g. base/intermediate or client-specific):', missingInSummary.slice(0, 10), '... total:', missingInSummary.length);
  }
}
