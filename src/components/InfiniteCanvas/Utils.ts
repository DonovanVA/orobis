import { findCycle } from "./Algorithms";
import { Dot, Node, Position, Edge } from "./Types";
import { colors } from "./UI";
/**
 *
 * @param selectedNode selected node
 * @param nodes list of nodes
 * @param dimheight height of the canvas
 * @param dimwidth width of the canvas
 * @returns collision status
 */
export function checkCollision(
  selectedNode: Node,
  nodes: Node[],
  dimheight: number,
  dimwidth: number
) {
  selectedNode.x <= 5 && (selectedNode.x = 5);
  selectedNode.y <= 5 && (selectedNode.y = 5);
  selectedNode.x >= dimwidth - selectedNode.width &&
    (selectedNode.x = dimwidth - selectedNode.width - 5);
  selectedNode.y >= dimheight - selectedNode.height &&
    (selectedNode.y = dimheight - selectedNode.height - 5);

  const collidedNode = nodes.find((neighbourNode: Node) => {
    return (
      neighbourNode.id !== selectedNode.id &&
      selectedNode.x + selectedNode.width > neighbourNode.x &&
      selectedNode.y + selectedNode.height > neighbourNode.y &&
      selectedNode.x < neighbourNode.x + neighbourNode.width &&
      selectedNode.y < neighbourNode.y + neighbourNode.height
    );
  });
  // If there is a collided node, prevent the selected node from overlapping it
  if (collidedNode) {
    const xOverlap =
      Math.min(
        selectedNode.x + selectedNode.width,
        collidedNode.x + collidedNode.width
      ) - Math.max(selectedNode.x, collidedNode.x);
    const yOverlap =
      Math.min(
        selectedNode.y + selectedNode.height,
        collidedNode.y + collidedNode.height
      ) - Math.max(selectedNode.y, collidedNode.y);

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
}
/**
 * Function to draw the edges
 * @param nodes nodes list
 * @param edges edges list
 * @param ctx canvas context
 */
export function drawEdges(
  nodes: Node[],
  edges: Edge[],
  ctx: CanvasRenderingContext2D,
  color: string
) {
  ctx.strokeStyle = color;
  edges.forEach((edge) => {
    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);
    // if there is a graph connection
    if (fromNode && toNode) {
      const fromCoordinates = dotCoordinates(fromNode);
      const toCoordinates = dotCoordinates(toNode);
      const { fromDotIndex, toDotIndex } = shortestDistancePair(
        fromCoordinates,
        toCoordinates
      );
      // find the control points and angle of the bezier curve
      const { cp1X, cp1Y, cp2X, cp2Y, dx, dy, angle } = findControlPoint(
        fromCoordinates[fromDotIndex].x,
        fromCoordinates[fromDotIndex].y,
        toCoordinates[toDotIndex].x,
        toCoordinates[toDotIndex].y
      );
      // draw the bezier curve
      ctx.beginPath();
      ctx.moveTo(
        fromCoordinates[fromDotIndex].x,
        fromCoordinates[fromDotIndex].y
      );
      ctx.bezierCurveTo(
        cp1X,
        cp1Y,
        cp2X,
        cp2Y,
        toCoordinates[toDotIndex].x,
        toCoordinates[toDotIndex].y
      );
      ctx.stroke();

      // calculate the direction of the curve (1/-1)
      const curveDirection = crossProduct(dx, dy, cp2X - cp1X, cp2Y - cp1Y);

      // adjust the arrow properties based on the direction of the curve
      const arrowLength = 10;
      const arrowAngle =
        angle + (curveDirection > 0 ? Math.PI / 0.9 : -Math.PI / 0.9);

      // calculate the midpoint of the curve using the bezierPoint() method
      const { bezierPointX, bezierPointY } = bezierMidPoint(
        0.5,
        fromCoordinates[fromDotIndex].x,
        fromCoordinates[fromDotIndex].y,
        cp1X,
        cp2X,
        toCoordinates[toDotIndex].x,
        cp1Y,
        cp2Y,
        toCoordinates[toDotIndex].y
      );

      // calculate the arrow coordinates for the first side
      const arrowCoords1 = calculateArrowCoords(
        bezierPointX,
        bezierPointY,
        arrowLength,
        arrowAngle
      );

      // draw the arrow for the first side
      ctx.beginPath();
      ctx.moveTo(arrowCoords1.x1, arrowCoords1.y1);
      ctx.lineTo(bezierPointX, bezierPointY);
      ctx.lineTo(arrowCoords1.x2, arrowCoords1.y2);
      ctx.stroke();
    }
  });
}
/**
 * function to draw the nodes
 * @param nodes nodes list
 * @param ctx canvas context
 */
export function drawNodes(nodes: Node[], ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = false; // disable anti-aliasing
  nodes.forEach((node: Node) => {
    ctx.fillStyle = node.fillStyle;
    ctx.fillRect(node.x, node.y, node.width, node.height);
    ctx.strokeStyle = node.strokeStyle;
    ctx.strokeRect(node.x, node.y, node.width, node.height);
    ctx.beginPath();
    drawDots(node, ctx);
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(node.id, node.x + node.width / 2, node.y + node.height / 2);
  });
}
/**
 * Function that draws the nodes on a given node
 * @param node
 * @param ctx
 */
function drawDots(node: Node, ctx: CanvasRenderingContext2D) {
  const edgeSpots: Dot[] = dotCoordinates(node);
  ctx.arc(
    edgeSpots[0].x,
    edgeSpots[0].y,
    3,
    0,
    2 * Math.PI * edgeSpots[0].radius
  );
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    edgeSpots[1].x,
    edgeSpots[1].y,
    3,
    0,
    2 * Math.PI * edgeSpots[1].radius
  );
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    edgeSpots[2].x,
    edgeSpots[2].y,
    3,
    0,
    2 * Math.PI * edgeSpots[2].radius
  );
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    edgeSpots[3].x,
    edgeSpots[3].y,
    3,
    0,
    2 * Math.PI * edgeSpots[3].radius
  );
  ctx.fillStyle = "black";
  ctx.fill();
}
/**
 * Function to drag the node
 * @param event : html mouse Event
 * @param left left offset
 * @param top top offset
 * @param selectedNode selected node
 * @param nodes nodes
 * @param setNodes state management for nodes
 * @param setSelectedNodePosition set the selected node position
 * @param setSelectedNode selected node position
 * @param dimheight height of the canvas
 * @param dimwidth width of the canvas
 */
export function dragNodes(
  event: React.MouseEvent<HTMLCanvasElement>,
  left: number,
  top: number,
  selectedNode: Node,
  nodes: Node[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setSelectedNodePosition: React.Dispatch<
    React.SetStateAction<Position | null>
  >,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>,
  dimheight: number,
  dimwidth: number
) {
  const x = event.clientX - left;
  const y = event.clientY - top;

  // get the new position of the node
  const dx = x - selectedNode.width / 2;
  const dy = y - selectedNode.height / 2;

  // find the selected node to update the position
  const newNodes = [...nodes];
  const nodeIndex = newNodes.findIndex((n) => n.id === selectedNode.id);

  if (nodeIndex >= 0) {
    setNodes((prevNodes) => {
      const newNodes = [...prevNodes];
      const nodeIndex = newNodes.findIndex((n) => n.id === selectedNode.id);
      const node = newNodes[nodeIndex];
      newNodes[nodeIndex] = { ...node, x: dx, y: dy };
      // check collision
      checkCollision(newNodes[nodeIndex], newNodes, dimheight, dimwidth);
      return newNodes;
    });
    setSelectedNode(nodes[nodeIndex]);
    setSelectedNodePosition({ x, y });
  }
}
/**
 *
 * @param event HTML mouse event
 * @param fromNode from Node
 * @param ctx canvas rendering context
 * @param left left offset of the canvas
 * @param top top offset of the canvas
 */
export function drawEdgetoCursor(
  event: React.MouseEvent<HTMLCanvasElement>,
  fromNode: Node,
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  color: string
) {
  // if there is a graph connection
  if (fromNode) {
    const fromCoordinates = dotCoordinates(fromNode);
    const toCoordinates = [
      { x: event.clientX - left, y: event.clientY - top, radius: 1 },
    ];
    const { fromDotIndex, toDotIndex } = shortestDistancePair(
      fromCoordinates,
      toCoordinates
    );
    // find the control points and angle of the bezier curve
    const { cp1X, cp1Y, cp2X, cp2Y, dx, dy, angle } = findControlPoint(
      fromCoordinates[fromDotIndex].x,
      fromCoordinates[fromDotIndex].y,
      toCoordinates[toDotIndex].x,
      toCoordinates[toDotIndex].y
    );

    // draw the bezier curve
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(
      fromCoordinates[fromDotIndex].x,
      fromCoordinates[fromDotIndex].y
    );
    ctx.bezierCurveTo(
      cp1X,
      cp1Y,
      cp2X,
      cp2Y,
      toCoordinates[toDotIndex].x,
      toCoordinates[toDotIndex].y
    );
    ctx.stroke();

    // calculate the direction of the curve (1/-1)
    const curveDirection = crossProduct(dx, dy, cp2X - cp1X, cp2Y - cp1Y);

    // adjust the arrow properties based on the direction of the curve
    const arrowLength = 10;
    const arrowAngle =
      angle + (curveDirection > 0 ? Math.PI / 0.9 : -Math.PI / 0.9);

    // calculate the midpoint of the curve using the bezierPoint() method
    const { bezierPointX, bezierPointY } = bezierMidPoint(
      0.5,
      fromCoordinates[fromDotIndex].x,
      fromCoordinates[fromDotIndex].y,
      cp1X,
      cp2X,
      toCoordinates[toDotIndex].x,
      cp1Y,
      cp2Y,
      toCoordinates[toDotIndex].y
    );

    // calculate the arrow coordinates for the first side
    const arrowCoords1 = calculateArrowCoords(
      bezierPointX,
      bezierPointY,
      arrowLength,
      arrowAngle
    );

    // draw the arrow for the first side
    ctx.beginPath();
    ctx.moveTo(arrowCoords1.x1, arrowCoords1.y1);
    ctx.lineTo(bezierPointX, bezierPointY);
    ctx.lineTo(arrowCoords1.x2, arrowCoords1.y2);
    ctx.stroke();
  }
}

/**
 *
 * @param fromNode from node
 * @param toNode to node
 * @param edges edges
 * @param setEdges state management for edges
 */
export function createEdge(
  fromNode: Node,
  toNode: Node,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) {
  const duplicateEdge = edges.find((edge) => {
    return edge.from === fromNode.id && edge.to === toNode.id;
  });

  if (!duplicateEdge) {
    let copyOfEdges = edges;
    copyOfEdges.push({
      from: fromNode.id,
      to: toNode.id,
      weight: 1,
    });
    setEdges(copyOfEdges);
  }
}
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
 * Calculates the control points of a quadratic bezier curve given two points.
 * @param fromX The x coordinate of the starting point.
 * @param fromY The y coordinate of the starting point.
 * @param toX The x coordinate of the ending point.
 * @param toY The y coordinate of the ending point.
 * @returns An object containing the x and y coordinates of the two control points,
 *          the delta x and y between the two points, and the angle between them.
 */
function findControlPoint(
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
/**
 * Determine the shortest path between 2 nodes dot points
 * @param from the array of from Dot
 * @param to the array of to Dot
 * @returns indexes of the shortest pair of dots
 */
function shortestDistancePair(from: Dot[], to: Dot[]) {
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
function crossProduct(x1: number, y1: number, x2: number, y2: number) {
  return x1 * y2 - x2 * y1;
}
/**
 * Calculates the coordinates of an arrow with a given length and angle,
 * originating from the specified (x, y) point.
 * @param x The x-coordinate of the starting point of the arrow.
 * @param y The y-coordinate of the starting point of the arrow.
 * @param length The length of the arrow.
 * @param angle The angle of the arrow, in radians.
 * @returns An object containing the x and y coordinates of the arrow's start and end points.
 */
function calculateArrowCoords(
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
function bezierMidPoint(
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
