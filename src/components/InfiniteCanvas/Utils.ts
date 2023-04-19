import { findCycle } from "./Algorithms";
import { BoundingBox, Position } from "./Types";
import { Node, NodeType } from "./UI/Nodes/Defaults/DefaultTypes";
import { Edge, Dot } from "./UI/Edges/Defaults/DefaultTypes";
import { dotCoordinates, shortestDistancePair, crossProduct } from "../Math/Math";
import { calculateArrowCoords, bezierMidPoint, findControlPoint } from "../Math/Bezier";
import { ConstructArc, ConstructRect } from "./UI/Nodes/Constructors";
import { EDGESCALE } from "./UI/Edges/Edges";
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
  selectedEdge: Edge | null,
  ctx: CanvasRenderingContext2D,
  defaultcolor: string,
  selectedEdgeColor: string
) {

  edges.forEach((edge) => {
    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);
    // if there is a graph connection
    if (fromNode && toNode) {

      if (selectedEdge && ((fromNode.id !== selectedEdge.from) || (toNode.id !== selectedEdge.to))) {
        console.log(fromNode)
        ctx.strokeStyle = defaultcolor;
      }
      else if(selectedEdge &&((fromNode.id === selectedEdge.from) || (toNode.id == selectedEdge.to))) {
        ctx.strokeStyle = selectedEdgeColor;
      }
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
      //refactor
      console.log(selectedEdge)
      if (fromNode.id === selectedEdge?.from && toNode.id === selectedEdge?.to) {
        const fromCoordinates = dotCoordinates(fromNode);
        const toCoordinates = dotCoordinates(toNode);
        const { fromDotIndex, toDotIndex } = shortestDistancePair(fromCoordinates, toCoordinates);
        // we implement a bounding box to find the edge
        const boundingBox = getBoundingBox(fromCoordinates[fromDotIndex].x, fromCoordinates[fromDotIndex].y, toCoordinates[toDotIndex].x, toCoordinates[toDotIndex].y,EDGESCALE);
        ctx.strokeRect(boundingBox.minX, boundingBox.minY, boundingBox.maxX - boundingBox.minX, boundingBox.maxY - boundingBox.minY);
      }

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
    if (node.type === NodeType.RECT) {
      ConstructRect(ctx, node)
      drawDots(node, ctx);
    }
    else if (node.type === NodeType.ARC) {
      ConstructArc(ctx, node)
      drawDots(node, ctx);
    }
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


export function isInsideDot(x: number, y: number, dot: Dot) {
  const dotLeeway = 10
  return (
    x >= dot.x - dot.radius - dotLeeway &&
    x <= dot.x + dot.radius + dotLeeway &&
    y >= dot.y - dot.radius - dotLeeway &&
    y <= dot.y + dot.radius + dotLeeway
  )
}

export function isInsideNode(x: number, y: number, node: Node) {
  return (
    x >= node.x &&
    x <= node.x + node.width &&
    y >= node.y &&
    y <= node.y + node.height
  );
}

export function getBoundingBox(x1: number, y1: number, x2: number, y2: number, shrinkAmount: number) {
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const center = {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
  const newHalfWidth = halfWidth - shrinkAmount / 2;
  const newHalfHeight = halfHeight;
  const minX = center.x - newHalfWidth;
  const maxX = center.x + newHalfWidth;
  const minY = center.y - newHalfHeight;
  const maxY = center.y + newHalfHeight;
  return { minX, maxX, minY, maxY };
}

export function isPointInsideBoundingBox(x: number, y: number, boundingBox: BoundingBox) {
  return x >= boundingBox.minX && x <= boundingBox.maxX && y >= boundingBox.minY && y <= boundingBox.maxY;
}