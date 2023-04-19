import { RefObject } from "react";
import { Position, ScrollPosition } from "./Types";
import {
  dragNodes,
  drawEdgetoCursor,
  drawNodes,
  drawEdges,
  createEdge,
  isInsideDot,
  isInsideNode,
  isPointInsideBoundingBox,
  getBoundingBox
} from "./Utils";
import { Node } from "./UI/Nodes/Defaults/DefaultTypes";
import { Edge, Dot } from "./UI/Edges/Defaults/DefaultTypes";
import { dotCoordinates } from "../Math/Math";
import { EDGESCALE, edgeColors } from "./UI/Edges/Edges";
import { defaultNodeConstructor } from "./UI/Nodes/Nodes";
import { shortestDistancePair } from "../Math/Math";
import { findControlPoint } from "../Math/Bezier";
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
  edges: Edge[],
  selectedNode: Node | null,
  selectedEdge: Edge | null,
  setSelectedEdge: React.Dispatch<React.SetStateAction<Edge | null>>,
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

  // Check if there's a node at the clicked position
  const node = nodes.find((node: Node) => {
    // Check if the click is inside any of the dots in the node
    const dots = dotCoordinates(node);
    const isClickInsideDot = dots.some((dot: Dot) => {
      return isInsideDot(x, y, dot);
    });
    // Return false if the click is inside any of the dots
    if (isClickInsideDot) {
      setDrawingEdge(true);
      isdrawing = true;
    }
    // Check if the click is inside the node
    return isInsideNode(x, y, node)
  });
  // If there's a node under the click and the user is not drawing select it
  if (node && !isdrawing) {
    // Update the state to reflect the selection
    const updatingNodes = nodes.map((n: Node) =>
      n.strokeStyle !== "#000000" ? { ...n, strokeStyle: "#000000" } : n
    );
    const updatedNodes = updatingNodes.map((n: Node) =>
      n.id === node.id ? { ...n, strokeStyle: defaultNodeConstructor.borderColorWhenSelected } : n
    );
    setNodes(updatedNodes);
    setSelectedNode(node);
    setSelectedNodePosition({ x, y });
  }
  if (node && isdrawing) {
    setSelectedNode(node);
    setSelectedNodePosition({ x, y });
  }
  // If there's no node under the click and a node is already selected, deselect it
  if (selectedNode && !node) {
    const updatedNodes = nodes.map((n: Node) =>
      n.strokeStyle !== "#000000" ? { ...n, strokeStyle: "#000000" } : n
    );
    setNodes(updatedNodes);
  }
  if (!selectedNode) {
    const findEdge = edges.find((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      //refactor
      if (fromNode && toNode) {
        const fromCoordinates = dotCoordinates(fromNode);
        const toCoordinates = dotCoordinates(toNode);
        const { fromDotIndex, toDotIndex } = shortestDistancePair(fromCoordinates, toCoordinates);
        // we implement a bounding box to find the edge
        const boundingBox = getBoundingBox(fromCoordinates[fromDotIndex].x, fromCoordinates[fromDotIndex].y, toCoordinates[toDotIndex].x, toCoordinates[toDotIndex].y, EDGESCALE);
        return isPointInsideBoundingBox(x, y, boundingBox);
      }
      return false;
    });
    !selectedEdge && setSelectedEdge(null)
    findEdge && setSelectedEdge(findEdge)

  }
  if (selectedEdge) {
    const findEdge = edges.find((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      //refactor
      if (fromNode && toNode) {
        const fromCoordinates = dotCoordinates(fromNode);
        const toCoordinates = dotCoordinates(toNode);
        const { fromDotIndex, toDotIndex } = shortestDistancePair(fromCoordinates, toCoordinates);
        // we implement a bounding box to find the edge
        const boundingBox = getBoundingBox(fromCoordinates[fromDotIndex].x, fromCoordinates[fromDotIndex].y, toCoordinates[toDotIndex].x, toCoordinates[toDotIndex].y, EDGESCALE);
        return isPointInsideBoundingBox(x, y, boundingBox);
      }
      return false;
    });
    !findEdge && setSelectedEdge(null)
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
  selectedEdge: Edge | null,
  selectedNode: Node | null,
  selectedNodePosition: Position | null,
  drawingEdge: boolean,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setSelectedNodePosition: React.Dispatch<
    React.SetStateAction<Position | null>
  >,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>,
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
      edgeColors.isDrawingEdgeStrokeStyle
    );
    // redraw the nodes
    drawEdges(nodes, edges, selectedEdge, ctx, edgeColors.defaultEdgeStrokeStyle, edgeColors.selectedEdgeColor);
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
  canvasRef: RefObject<HTMLCanvasElement>,
  nodes: Node[],
  edges: Edge[],
  selectedNode: Node | null,
  drawingEdge: boolean,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>,
  setSelectedNodePosition: React.Dispatch<
    React.SetStateAction<ScrollPosition | null>
  >,
  setDrawingEdge: React.Dispatch<React.SetStateAction<boolean>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,

) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const { left, top } = canvas.getBoundingClientRect();
  const x = event.clientX - left;
  const y = event.clientY - top;
  // check if its drawing edge and the cursor is within the position of a node,

  if (drawingEdge) {
    const toNode = nodes.find((node: Node) => {
      return isInsideNode(x, y, node)
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
export const handleKeyDown = (
  e: KeyboardEvent,
  nodes: Node[],
  selectedNode: Node | null,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>, setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>) => {
  if ((e.code === "Delete" || e.code === "Backspace") && selectedNode) {
    const newNodes = nodes.filter((node: Node) => node.id !== selectedNode.id)
    setNodes(newNodes);
    setSelectedNode(null);
  }
};