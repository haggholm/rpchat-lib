'use strict';

import Lazy from 'lazy';
import Immutable from 'seamless-immutable';


/**
 * @public
 */
class TreeNode {
  /**
   * @param {Object} object
   * @param {Object} opts
   * @param {TreeNode} opts.parent
   * @param {TreeNode[]} opts.children
   */
  constructor(object, opts) {
    if (object === null || object === undefined) {
      throw new Error('TreeNode value object must be defined');
    }
    this.object = object;
    this.children = (opts && opts.children) || [];
    this.parent = (opts && opts.parent) || null;
  }

  /** @returns {boolean} */
  isLeaf() {
    return this.children === null ||
           this.children === undefined ||
           this.children.length === 0;
  }

  /** @returns {boolean} */
  isRoot() {
    return this.parent === null ||
           this.parent === undefined;
  }
}


function setDepth(node, depth) {
  node.depth = depth;
  Lazy(node.children).each((child) => setDepth(child, depth + 1));
}

/**
 * @param {object[]} objects Objects with _id property
 * @return {TreeNode[]} TreeNodes containing objects, with fully initialised
 *                  tree structure
 */
export function makeTree(objects) {
  objects = Lazy(objects);

  let nodesById = objects.map((ob) => [ob._id, new TreeNode(ob)]).toObject();

  let tree = Lazy(nodesById).each((node) => {
    if (node.object.parentId) {
      const parent = nodesById.get(node.object.parentId);
      parent.children.push(node);
      node.parent = parent;
    }
  });

  tree.filter((node) => node.isRoot()).each((root) => setDepth(root, 0));

  return Immutable(nodesById.value());
}

/**
 * @param {TreeNode[]} trees
 * @return {TreeNode[]}
 */
export function leaves(trees) {
  return Lazy(trees).filter((node) => node.isLeaf()).toArray();
}

/**
 * @param {TreeNode[]} trees
 * @return {TreeNode[]}
 */
export function roots(trees) {
  return Lazy(trees).filter((node) => node.isRoot()).toArray();
}
