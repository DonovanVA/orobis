import { Node } from "./Types";
import { Dot } from "./Types";
export function checkCollision(selectedNode: Node, nodes: Node[], dimheight: number, dimwidth: number) {
  selectedNode.x <= 5 && (selectedNode.x = 5);
  selectedNode.y <= 5 && (selectedNode.y = 5);
  selectedNode.x >= dimwidth - selectedNode.width && (selectedNode.x = dimwidth - selectedNode.width - 5);
  selectedNode.y >= dimheight - selectedNode.height && (selectedNode.y = dimheight - selectedNode.height - 5);

  const collidedNode = nodes
    .find((neighbourNode: Node) => {
      return (
        neighbourNode.id !== selectedNode.id &&
        selectedNode.x + selectedNode.width > neighbourNode.x &&
        selectedNode.y + selectedNode.height > neighbourNode.y &&
        selectedNode.x < neighbourNode.x + neighbourNode.width &&
        selectedNode.y < neighbourNode.y + neighbourNode.height)
    })
  // If there is a collided node, prevent the selected node from overlapping it
  if (collidedNode) {
    const xOverlap = Math.min(selectedNode.x + selectedNode.width, collidedNode.x + collidedNode.width) - Math.max(selectedNode.x, collidedNode.x);
    const yOverlap = Math.min(selectedNode.y + selectedNode.height, collidedNode.y + collidedNode.height) - Math.max(selectedNode.y, collidedNode.y);

    if (xOverlap < yOverlap) {
      if (selectedNode.x < collidedNode.x) {
        selectedNode.x = collidedNode.x - selectedNode.width;
      } else {
        selectedNode.x = collidedNode.x + collidedNode.width;
      }
    } else {
      if (selectedNode.y < collidedNode.y) {
        selectedNode.y = collidedNode.y - selectedNode.height;
      } else {
        selectedNode.y = collidedNode.y + collidedNode.height;
      }
    }
  }

  return collidedNode; // return the modified selectedNode
};

export function drawEdges(nodes: Node[], ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#00FF00"
  nodes.forEach((node) => {
    node.edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      // if there is a graph connection
      if (fromNode && toNode) {
        const fromX = fromNode.x + fromNode.width / 2;
        const fromY = fromNode.y + fromNode.height / 2;
        const toX = toNode.x + toNode.width / 2;
        const toY = toNode.y + toNode.height / 2;
        // find the control points and angle of the bezier curve
        const { cp1X, cp1Y, cp2X, cp2Y, dx, dy, angle } = findControlPoint(fromX, fromY, toX, toY)
        // draw the bezier curve
        ctx.beginPath();
        ctx.moveTo(fromX, fromY)
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toX, toY);
        ctx.stroke();

        // calculate the direction of the curve (1/-1)
        const curveDirection = crossProduct(dx, dy, cp2X - cp1X, cp2Y - cp1Y);

        // adjust the arrow properties based on the direction of the curve
        const arrowLength = 10;
        const arrowAngle =
          angle + (curveDirection > 0 ? Math.PI / 0.9 : -Math.PI / 0.9);

        // calculate the midpoint of the curve using the bezierPoint() method
        const { bezierPointX, bezierPointY } = bezierMidPoint(0.5, fromX, fromY, cp1X, cp2X, toX, cp1Y, cp2Y, toY)

        // calculate the arrow coordinates for the first side
        const arrowCoords1 = calculateArrowCoords(bezierPointX, bezierPointY, arrowLength, arrowAngle);

        // draw the arrow for the first side
        ctx.beginPath();
        ctx.moveTo(arrowCoords1.x1, arrowCoords1.y1);
        ctx.lineTo(bezierPointX, bezierPointY);
        ctx.lineTo(arrowCoords1.x2, arrowCoords1.y2);
        ctx.stroke();


      }
    });
  });

}
export function drawNodes(nodes: Node[], ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = false; // disable anti-aliasing
  nodes.forEach((node: Node) => {
    ctx.fillStyle = node.fillStyle;
    ctx.fillRect(node.x, node.y, node.width, node.height);
    ctx.strokeStyle = node.strokeStyle;
    ctx.strokeRect(node.x, node.y, node.width, node.height);
    ctx.beginPath();
    ctx.arc(node.x + node.width, node.y + node.height / 2, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x + node.width / 2, node.y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x, node.y + node.height / 2, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x + node.width / 2, node.y + node.height, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText(node.id, node.x + node.width / 2, node.y + node.height / 2);
  });
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
 * Calculates the coordinates of an arrow with a given length and angle,
 * originating from the specified (x, y) point.
 *
 * @param x The x-coordinate of the starting point of the arrow.
 * @param y The y-coordinate of the starting point of the arrow.
 * @param length The length of the arrow.
 * @param angle The angle of the arrow, in radians.
 * @returns An object containing the x and y coordinates of the arrow's start and end points.
 */
export function calculateArrowCoords(x: number, y: number, length: number, angle: number) {
  const x1 = x + length * Math.cos(angle - Math.PI / 6);
  const y1 = y + length * Math.sin(angle - Math.PI / 6);
  const x2 = x + length * Math.cos(angle + Math.PI / 6);
  const y2 = y + length * Math.sin(angle + Math.PI / 6);
  return { x1, y1, x2, y2 };
}
/**
 * Calculates the position of a point on a cubic bezier curve given a value of t between 0 and 1.
 * @param t The value of t between 0 and 1.
 * @param fromX The starting x-coordinate of the curve.
 * @param fromY The starting y-coordinate of the curve.
 * @param cp1X The x-coordinate of the first control point of the curve.
 * @param cp2X The x-coordinate of the second control point of the curve.
 * @param toX The ending x-coordinate of the curve.
 * @param cp1Y The y-coordinate of the first control point of the curve.
 * @param cp2Y The y-coordinate of the second control point of the curve.
 * @param toY The ending y-coordinate of the curve.
 * @returns An object containing the x and y coordinates of the point on the curve at the given value of t.
 */
export function bezierMidPoint(
  t: number,
  fromX: number,
  fromY: number,
  cp1X: number,
  cp2X: number,
  toX: number,
  cp1Y: number,
  cp2Y: number,
  toY: number
): { bezierPointX: number, bezierPointY: number } {
  const bezierPointX =
    Math.pow(1 - t, 3) * fromX +
    3 * Math.pow(1 - t, 2) * t * cp1X +
    3 * (1 - t) * Math.pow(t, 2) * cp2X +
    Math.pow(t, 3) * toX;
  const bezierPointY =
    Math.pow(1 - t, 3) * fromY +
    3 * Math.pow(1 - t, 2) * t * cp1Y +
    3 * (1 - t) * Math.pow(t, 2) * cp2Y +
    Math.pow(t, 3) * toY;

  return { bezierPointX, bezierPointY };
}


/**
 * Calculates the control points of a quadratic bezier curve given two points.
 * 
 * @param fromX The x coordinate of the starting point.
 * @param fromY The y coordinate of the starting point.
 * @param toX The x coordinate of the ending point.
 * @param toY The y coordinate of the ending point.
 * @returns An object containing the x and y coordinates of the two control points,
 *          the delta x and y between the two points, and the angle between them.
 */
function findControlPoint(fromX: number, fromY: number, toX: number, toY: number) {

  // Calculate the delta x and y between the two points
  const dx = toX - fromX;
  const dy = toY - fromY;

  // Calculate the euclidean distance between the two points
  const dist = euclideanDistance(fromX, fromY, toX, toY);

  // Calculate the angle between the two points and the x-axis
  const angle = Math.atan2(dy, dx);

  // Calculate the angles between the two points and the control points
  const angle1 = angle + Math.atan2(dy, dx) + Math.PI / 2;
  const angle2 = angle + Math.atan2(dy, dx) - Math.PI / 2;

  // Calculate the x and y coordinates of the control points
  const cp1X = fromX + (dist / 4) * Math.cos(angle1);
  const cp1Y = fromY + (dist / 4) * Math.sin(angle1);
  const cp2X = toX + (dist / 4) * Math.cos(angle2);
  const cp2Y = toY + (dist / 4) * Math.sin(angle2);

  // Return an object containing the control points, delta x and y, and angle
  return { cp1X, cp1Y, cp2X, cp2Y, dx, dy, angle };
}





/**
 * Calculates the given euclidean distance between 2 points
 * @param x1 the x coordinate of the first point
 * @param y1 the y coordinate of the second point
 * @param x2 the x coordinate of the first point
 * @param y2 the y coordinate of the second point
 * @returns the euclidean distance between (x1,y1) and (x2,y2)
 */
function euclideanDistance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}