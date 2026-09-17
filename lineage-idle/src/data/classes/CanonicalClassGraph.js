/**
 * CanonicalClassGraph.js — Direct Acyclic Graph (DAG) for Lineage II Essence Classes
 * 
 * Implements pure queries for nodes, transitions, ancestry, descendants, and race roots.
 * Authoritative: 159 nodes, 134 edges, 25 roots (stage 0), 49 terminals (stage 3).
 * Architecture: DATA layer (Immutable & Pure)
 */

import { CANONICAL_CLASS_REGISTRY } from './CanonicalClassRegistry.js';

class ClassGraph {
  constructor(registry) {
    this.registry = registry;
    this.nodes = new Map();
    this.edges = new Map(); // parentId -> Set of childIds
    this.inEdges = new Map(); // childId -> parentId
    this.raceRoots = new Map(); // raceId -> Set of stage 0 classIds
    this.terminals = new Set();
    this.lineageTerminals = new Map(); // lineageId -> terminalClassId

    this._buildGraph();
  }

  _buildGraph() {
    for (const [id, node] of Object.entries(this.registry)) {
      this.nodes.set(id, node);
      this.edges.set(id, new Set());

      if (node.stage === 0) {
        if (!this.raceRoots.has(node.race)) {
          this.raceRoots.set(node.race, new Set());
        }
        this.raceRoots.get(node.race).add(id);
      }
    }

    for (const [id, node] of Object.entries(this.registry)) {
      if (node.parentClass) {
        if (this.edges.has(node.parentClass)) {
          this.edges.get(node.parentClass).add(id);
        }
        this.inEdges.set(id, node.parentClass);
      }
    }

    for (const [id, children] of this.edges.entries()) {
      if (children.size === 0) {
        this.terminals.add(id);
        const node = this.nodes.get(id);
        if (node && node.lineageId) {
          this.lineageTerminals.set(node.lineageId, id);
        }
      }
    }
  }

  getClassNode(classId) {
    if (!classId) return null;
    return this.nodes.get(String(classId)) || null;
  }

  hasNode(classId) {
    return this.nodes.has(String(classId));
  }

  getSuccessors(classId) {
    const children = this.edges.get(String(classId));
    if (!children) return [];
    return Array.from(children).map(id => this.nodes.get(id));
  }

  getPredecessor(classId) {
    const parentId = this.inEdges.get(String(classId));
    if (!parentId) return null;
    return this.nodes.get(parentId) || null;
  }

  getAncestors(classId) {
    const ancestors = [];
    let curr = this.getPredecessor(classId);
    const visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      ancestors.push(curr);
      curr = this.getPredecessor(curr.id);
    }
    return ancestors;
  }

  getDescendants(classId) {
    const descendants = [];
    const queue = [...this.getSuccessors(classId)];
    const visited = new Set(queue.map(n => n.id));

    while (queue.length > 0) {
      const next = queue.shift();
      descendants.push(next);
      for (const child of this.getSuccessors(next.id)) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          queue.push(child);
        }
      }
    }
    return descendants;
  }

  getBaseClassesForRace(raceId) {
    const roots = this.raceRoots.get(String(raceId));
    if (!roots) return [];
    return Array.from(roots).map(id => this.nodes.get(id));
  }

  getLineageChain(classId) {
    const node = this.getClassNode(classId);
    if (!node) return [];
    const ancestors = this.getAncestors(classId).reverse();
    return [...ancestors, node];
  }

  getNodesCount() {
    return this.nodes.size;
  }

  getEdgesCount() {
    let count = 0;
    for (const children of this.edges.values()) {
      count += children.size;
    }
    return count;
  }

  getRootNodesCount() {
    let count = 0;
    for (const roots of this.raceRoots.values()) {
      count += roots.size;
    }
    return count;
  }

  getTerminalNodesCount() {
    return this.terminals.size;
  }

  getThirdStageNodesCount() {
    let count = 0;
    for (const node of this.nodes.values()) {
      if (node.stage === 3) count++;
    }
    return count;
  }

  getLineagesCount() {
    return this.lineageTerminals.size;
  }

  getAllClassNodes() {
    return Array.from(this.nodes.values());
  }

  getAllEdges() {
    const edgeList = [];
    for (const [from, children] of this.edges.entries()) {
      for (const to of children) {
        edgeList.push({ from, to });
      }
    }
    return edgeList;
  }

  getRootClasses() {
    const roots = [];
    for (const node of this.nodes.values()) {
      if (!node.parentClass || node.stage === 0) {
        roots.push(node);
      }
    }
    return roots;
  }

  getTerminalClasses() {
    return Array.from(this.terminals).map(id => this.nodes.get(id));
  }

  topologicalSort() {
    const inDegree = new Map();
    for (const id of this.nodes.keys()) inDegree.set(id, 0);
    for (const parentId of this.inEdges.values()) {}
    for (const childId of this.inEdges.keys()) {
      inDegree.set(childId, (inDegree.get(childId) || 0) + 1);
    }

    const roots = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) roots.push(id);
    }

    const order = [];
    const q = [...roots];
    const tempIn = new Map(inDegree);

    while (q.length > 0) {
      const u = q.shift();
      order.push(this.nodes.get(u));
      const children = this.edges.get(u) || new Set();
      for (const v of children) {
        const d = tempIn.get(v) - 1;
        tempIn.set(v, d);
        if (d === 0) q.push(v);
      }
    }

    return order;
  }

  validateIntegrity() {
    const visited = new Set();
    let hasCycle = false;
    const roots = [];
    for (const node of this.nodes.values()) {
      if (!node.parentClass) roots.push(node.id);
    }

    // Topological verification
    const inDegree = new Map();
    for (const id of this.nodes.keys()) inDegree.set(id, 0);
    for (const parentId of this.inEdges.values()) {
      // each child has 1 parent
    }
    for (const [childId, parentId] of this.inEdges.entries()) {
      inDegree.set(childId, (inDegree.get(childId) || 0) + 1);
    }

    const q = [...roots];
    let processed = 0;
    const tempIn = new Map(inDegree);

    while (q.length > 0) {
      const u = q.shift();
      processed++;
      const children = this.edges.get(u) || new Set();
      for (const v of children) {
        const d = tempIn.get(v) - 1;
        tempIn.set(v, d);
        if (d === 0) q.push(v);
      }
    }

    return {
      nodesCount: this.getNodesCount(),
      edgesCount: this.getEdgesCount(),
      rootsCount: this.getRootNodesCount(),
      terminalsCount: this.getTerminalNodesCount(),
      thirdStageNodesCount: this.getThirdStageNodesCount(),
      lineagesCount: this.getLineagesCount(),
      isValidDAG: processed === this.nodes.size,
      processedInOrder: processed
    };
  }
}

export const CanonicalClassGraph = new ClassGraph(CANONICAL_CLASS_REGISTRY);
export default CanonicalClassGraph;
