'use strict';

import Lazy from 'lazy';
import _ from 'lodash';


function getId(node) {
  return node.object._id;
}


function sum(values) {
  let s = 0;
  for (let i = values.length - 1; i >= 0; --i) {
    s += values[i];
  }
  return s;
}

export function pointsToValue(points) {
  if (points < 0) {
    return -pointsToValue(-points);
  }
  // Inverse of Σ[n=1..value](n)  ->  ½ * [ √(8n+1) - 1 ]
  return Math.floor(
    (Math.sqrt(8.0 * points + 1.0) - 1.0) / 2.0
  );
}

export function valueToPoints(value) {
  if (value < 0) {
    return -valueToPoints(-value);
  }
  // Σ[n=1..value](n)
  return (value * (value+1)) / 2;
}

const EXP_SHARE_FACTOR = 3,
  EXP_PARENT_FACTOR = 1.0 / EXP_SHARE_FACTOR,
  EXP_CHILD_FACTOR = 1 - EXP_PARENT_FACTOR;


/**
 * @param {TreeNode[]} nodes
 * @return {TreeNode[]}
 */
export function recalculateValues(nodes) {
  let getAccumulatedPoints = _.memoize((node) => {
    node.accumulatedPoints = (node.object.points +
                              sum(Lazy(node.children).map(getAccumulatedPoints).toArray()));
    return node.accumulatedPoints;
  }, (node) => node.object._id);

  var getEffectivePoints = _.memoize(function(node) {
    // @TODO: This is probably wrong.
    if (node.parent.isRoot()) {
      let parentPoints = getAccumulatedPoints(node.parent) * EXP_PARENT_FACTOR;
      let childPoints = node.object.points * EXP_CHILD_FACTOR;
      node.effectivePoints = childPoints + parentPoints;
    } else {
      node.effectivePoints = node.object.points;
    }
    return node.effectivePoints;
  }, (node) => node.object._id);

  _.map(nodes, function(node){
    node.value = isLeaf(node) ?
      pointsToValue(getEffectivePoints(node)) :
      pointsToValue(node.accumulatedPoints / EXP_SHARE_FACTOR);
  });
}
