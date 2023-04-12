import { RefObject } from "react";
import { Position, ScrollPosition, Node, Dot, Edge } from "./Types";
import {
  dragNodes,
  dotCoordinates,
  drawEdgetoCursor,
  drawNodes,
  drawEdges,
  createEdge,
} from "./Utils";
import { colors } from "./UI";

/**
 * This function handles the mouse down event
 * @param event A html mouse event
 * @param canvasRef A useRef for canvas
 * @param nodes Nodes on the canvas
 * @param selecting Selecting state of the mouse
 * @param setSelecting State management for selecting state of the mouse
 * @param setNodes State management for nodes
 * @param setSelectedNodePosition State management for selected node position
 * @param setSelectedNode State management for selected node
 * @returns void
 */
export const handleMouseDown = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  nodes: Node[],
  selecting: boolean,
  setSelecting: React.Dispatch<React.SetStateAction<boolean>>,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setSelectedNodePosition: React.Dispatch<
    React.SetStateAction<ScrollPosition | null>
  >,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>,
  setDrawingEdge: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Ignore right click events
  if (event.button !== 0) return;
  // Get the canvas element
  const canvas = canvasRef.current;
  if (!canvas) return;
  // Get the position of the mouse click relative to the canvas
  const { left, top } = canvas.getBoundingClientRect();
  const x = event.clientX - left;
  const y = event.clientY - top;
  let isdrawing = false;
  // Define the leeway for the dots
  const dotLeeway = 8;
  // Check if there's a node at the clicked position
  const node = nodes.find((node: Node) => {
    // Check if the click is inside any of the dots in the node
    const dots = dotCoordinates(node);
    const isClickInsideDot = dots.some((dot: Dot) => {
      return (
        x >= dot.x - dot.radius - dotLeeway &&
        x <= dot.x + dot.radius + dotLeeway &&
        y >= dot.y - dot.radius - dotLeeway &&
        y <= dot.y + dot.radius + dotLeeway
      );
    });
    // Return false if the click is inside any of the dots
    if (isClickInsideDot) {
      setDrawingEdge(true);
      isdrawing = true;
    }
    // Check if the click is inside the node
    return (
      x >= node.x &&
      x <= node.x + node.width &&
      y >= node.y &&
      y <= node.y + node.height
    );
  });
  // If there's a node under the click and the user is not drawing select it
  if (node && !isdrawing) {
    // Update the state to reflect the selection
    const updatingNodes = nodes.map((n: Node) =>
      n.strokeStyle !== "#000000" ? { ...n, strokeStyle: "#000000" } : n
    );
    const updatedNodes = updatingNodes.map((n: Node) =>
      n.id === node.id ? { ...n, strokeStyle: "#0000FF" } : n
    );
    setSelecting(true);
    setNodes(updatedNodes);
    setSelectedNode(node);
    setSelectedNodePosition({ x, y });
  }
  if (node && isdrawing) {
    setSelectedNode(node);
    setSelectedNodePosition({ x, y });
  }
  // If there's no node under the click and a node is already selected, deselect it
  if (selecting && !node) {
    setSelecting(false);
    const updatedNodes = nodes.map((n: Node) =>
      n.strokeStyle !== "#000000" ? { ...n, strokeStyle: "#000000" } : n
    );
    setNodes(updatedNodes);
  }
};

/**
 * This function handles the mouse move event
 * @param event A html mouse event
 * @param canvasRef A useRef for canvas
 * @param nodesNodes on the canvas
 * @param selectedNode selected node
 * @param selectedNodePosition selected node position
 * @param setNodes State management for nodes
 * @param setSelectedNodePosition State management for selected node position
 * @param setSelectedNode State management for selected node
 * @param dimheight Height of the canvas
 * @param dimwidth Width of the canvas
 * @returns Void
 */
export const handleMouseMove = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  nodes: Node[],
  edges: Edge[],
  selectedNode: Node | null,
  selectedNodePosition: Position | null,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setSelectedNodePosition: React.Dispatch<
    React.SetStateAction<Position | null>
  >,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>,
  drawingEdge: boolean,
  dimheight: number,
  dimwidth: number
) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // get the params of the canvas
  const { left, top } = canvas.getBoundingClientRect();
  if (selectedNode && selectedNodePosition && !drawingEdge) {
    dragNodes(
      event,
      left,
      top,
      selectedNode,
      nodes,
      setNodes,
      setSelectedNodePosition,
      setSelectedNode,
      dimheight,
      dimwidth
    );
  } else if (selectedNode && selectedNodePosition && drawingEdge) {
    // Clear the previous edge drawn
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the new edge at the updated position of the mouse cursor
    drawEdgetoCursor(
      event,
      selectedNode,
      ctx,
      left,
      top,
      colors.isDrawingEdgeStrokeStyle
    );
    // redraw the nodes
    drawEdges(nodes, edges, ctx, colors.defaultEdgeStrokeStyle);
    drawNodes(nodes, ctx);
  }
};
/**
 * This funcion handles then mouse up event
 * @param setSelectedNode State management for selected node
 * @param setSelectedNodePosition State management for selected node position
 */
export const handleMouseUp = (
  event: React.MouseEvent<HTMLCanvasElement>,
  selectedNode: Node | null,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>,
  setSelectedNodePosition: React.Dispatch<
    React.SetStateAction<ScrollPosition | null>
  >,
  drawingEdge: boolean,
  setDrawingEdge: React.Dispatch<React.SetStateAction<boolean>>,
  nodes: Node[],
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
) => {
  // check if its drawing edge and the cursor is within the position of a node,
  if (drawingEdge) {
    const toNode = nodes.find((node: Node) => {
      return (
        event.clientX >= node.x &&
        event.clientX <= node.x + node.width &&
        event.clientY >= node.y &&
        event.clientY <= node.y + node.height
      );
    });
    selectedNode?.id !== toNode?.id &&
      selectedNode &&
      toNode &&
      createEdge(selectedNode, toNode, edges, setEdges);
  }
  // remove any selection events
  setDrawingEdge(false);
  // deselect node
  setSelectedNode(null);
  setSelectedNodePosition(null);
};
