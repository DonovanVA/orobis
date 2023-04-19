import { euclideanDistance } from "./Math";
import { Dot } from "../InfiniteCanvas/UI/Edges/Defaults/DefaultTypes";
import { Position } from "../InfiniteCanvas/Types";
/**
   * Calculates the coordinates of an arrow with a given length and angle,
   * originating from the specified (x, y) point.
   * @param x The x-coordinate of the starting point of the arrow.
   * @param y The y-coordinate of the starting point of the arrow.
   * @param length The length of the arrow.
   * @param angle The angle of the arrow, in radians.
   * @returns An object containing the x and y coordinates of the arrow's start and end points.
   */
export function calculateArrowCoords(
    x: number,
    y: number,
    length: number,
    angle: number
) {
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
): { bezierPointX: number; bezierPointY: number } {
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
  * @param fromX The x coordinate of the starting point.
  * @param fromY The y coordinate of the starting point.
  * @param toX The x coordinate of the ending point.
  * @param toY The y coordinate of the ending point.
  * @returns An object containing the x and y coordinates of the two control points,
  *          the delta x and y between the two points, and the angle between them.
  */
export function findControlPoint(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
) {
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
export function getBezierCurveCoordinates(dot1: Dot, dot2: Dot) {
    const points: Position[] = [];
  
    // Calculate control points
    const dx = dot2.x - dot1.x;
    const dy = dot2.y - dot1.y;
    const cp1x = dot1.x + dx / 3;
    const cp1y = dot1.y + dy / 3;
    const cp2x = dot1.x + 2 * dx / 3;
    const cp2y = dot1.y + 2 * dy / 3;
    
    for (let t = 0; t <= 1; t += 0.01) {
      // Calculate point on curve using cubic Bezier formula
      const x = dot1.x * (1 - t) ** 3 + 3 * cp1x * (1 - t) ** 2 * t + 3 * cp2x * (1 - t) * t ** 2 + dot2.x * t ** 3;
      const y = dot1.y * (1 - t) ** 3 + 3 * cp1y * (1 - t) ** 2 * t + 3 * cp2y * (1 - t) * t ** 2 + dot2.y * t ** 3;
      
      points.push({ x, y });
    }
    return points;
  };