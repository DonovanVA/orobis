import { Position } from "../InfiniteCanvas/Types";
import { Node } from "../InfiniteCanvas/UI/Nodes/Defaults/DefaultTypes";
import { Dot } from "../InfiniteCanvas/UI/Edges/Defaults/DefaultTypes";
/**
 * Determine the coordinates of the dots given a node
 * @param node : node of the object
 * @returns an array of dots on the node
 */
export function dotCoordinates(node: Node) {
  return [
    {
      x: node.x + node.width,
      y: node.y + node.height / 2,
      radius: 1,
    },
    {
      x: node.x + node.width / 2,
      y: node.y,
      radius: 1,
    },
    {
      x: node.x,
      y: node.y + node.height / 2,
      radius: 1,
    },
    {
      x: node.x + node.width / 2,
      y: node.y + node.height,
      radius: 1,
    },
  ];
}

/**
 * Determine the shortest path between 2 nodes dot points
 * @param from the array of from Dot
 * @param to the array of to Dot
 * @returns indexes of the shortest pair of dots
 */
export function shortestDistancePair(from: Dot[], to: Dot[]) {
  let shortestDistance = 0;
  let fromDotIndex = 0;
  let toDotIndex = 0;
  from.map((fromDot: Dot, fromIndex: number) => {
    to.map((toDot: Dot, toIndex: number) => {
      let newShortestDistance = euclideanDistance(
        fromDot.x,
        fromDot.y,
        toDot.x,
        toDot.y
      );
      if (shortestDistance <= 0 || newShortestDistance < shortestDistance) {
        shortestDistance = newShortestDistance;
        fromDotIndex = fromIndex;
        toDotIndex = toIndex;
      }
    });
  });
  return { fromDotIndex, toDotIndex };
}

/**
 * Calculates the cross product of the 2 points
 * @param x1 the x coordinate of the first point
 * @param y1 the y coordinate of the second point
 * @param x2 the x coordinate of the first point
 * @param y2 the y coordinate of the second point
 * @returns the cross product between (x1,y1) and (x2,y2)
 */
export function crossProduct(x1: number, y1: number, x2: number, y2: number) {
  return x1 * y2 - x2 * y1;
}


/**
 * Calculates the given euclidean distance between 2 points
 * @param x1 the x coordinate of the first point
 * @param y1 the y coordinate of the second point
 * @param x2 the x coordinate of the first point
 * @param y2 the y coordinate of the second point
 * @returns the euclidean distance between (x1,y1) and (x2,y2)
 */
export function euclideanDistance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

