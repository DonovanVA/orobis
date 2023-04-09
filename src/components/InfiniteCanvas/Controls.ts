import { RefObject } from "react";
import { Position, ScrollPosition, Node, InfiniteCanvasProps } from "./Types";
import { checkCollision } from "./Utils";

/**
 * This function handles the scroll event
 * @param event : A html mouse event
 * @param setScrollPosition : State management for scroll position
 */
export const handleScroll = (event: React.UIEvent<HTMLCanvasElement>, setScrollPosition: React.Dispatch<ScrollPosition>) => {
  const { scrollLeft, scrollTop } = event.currentTarget;
  setScrollPosition({ x: scrollLeft, y: scrollTop });
};/**
 * This function handles the mouse wheel event
 * @param event A html mouse event
 */
export const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {

};
/**
 * This function handles the mouse down event
 * @param event A html mouse event
 * @param canvasRef A useRef for canvas
 * @param zoomLevel Current zoom level
 * @param scrollPosition Current scroll position
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
  zoomLevel: number,
  scrollPosition: ScrollPosition,
  nodes: Node[],
  selecting: boolean,
  setSelecting: React.Dispatch<React.SetStateAction<boolean>>,
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setSelectedNodePosition: React.Dispatch<React.SetStateAction<ScrollPosition | null>>,
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>
) => {
  // Ignore right click events
  if (event.button !== 0) return;
  // Get the canvas element
  const canvas = canvasRef.current;
  if (!canvas) return;
  // Get the position of the mouse click relative to the canvas
  const { left, top } = canvas.getBoundingClientRect();
  const x = zoomLevel !== 0 ? (event.clientX - left) / zoomLevel + scrollPosition.x : 0.2;
  const y = zoomLevel !== 0 ? (event.clientY - top) / zoomLevel + scrollPosition.y : 0.2;
  // Check if there's a node at the clicked position
  const node = nodes.find(
    (n) => x >= n.x && x <= n.x + n.width && y >= n.y && y <= n.y + n.height
  );
  // If there's a node under the click, select it
  console.log(x,y)
  console.log(node)
  if (node) {
    // Update the state to reflect the selection
    const updatingNodes = nodes.map((n:Node) =>
      n.strokeStyle !== "#000000" ? { ...n, strokeStyle: "#000000" } : n
    )
    const updatedNodes = updatingNodes.map((n:Node) =>
      n.id === node.id ? { ...n, strokeStyle: "#0000FF" } : n
    );
    setSelecting(true)
    setNodes(updatedNodes);
    setSelectedNode(node);
    setSelectedNodePosition({ x, y });
  }
  // If there's no node under the click and a node is already selected, deselect it
  if (selecting && !node) {
    setSelecting(false);
    const updatedNodes = nodes.map((n:Node) =>
      n.strokeStyle !== "#000000" ? { ...n, strokeStyle: "#000000" } : n
    )
    setNodes(updatedNodes);
  }
};
/**
 * This function handles the mouse move event
 * @param event A html mouse event
 * @param canvasRef A useRef for canvas
 * @param zoomLevel Current zoom level
 * @param scrollPosition Current scroll position
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
export const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>, canvasRef: RefObject<HTMLCanvasElement>, zoomLevel: number, scrollPosition: ScrollPosition, nodes: Node[], selectedNode: Node | null, selectedNodePosition: Position | null, setNodes: React.Dispatch<React.SetStateAction<Node[]>>, setSelectedNodePosition: React.Dispatch<React.SetStateAction<ScrollPosition | null>>, setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>, dimheight: number, dimwidth: number) => {
  if (!selectedNode || !selectedNodePosition) return;
  const canvas = canvasRef.current;
  if (!canvas) return;
  // get the params of the canvas
  const { left, top } = canvas.getBoundingClientRect();
  // Get the position of the mouse click relative to the canvas
  const x = zoomLevel !== 0 ? (event.clientX - left) / zoomLevel + scrollPosition.x : 0.2;
  const y = zoomLevel !== 0 ? (event.clientY - top) / zoomLevel + scrollPosition.y : 0.2;
  // Get the off set of wrt to the center of the node
  const cx = (selectedNode.width / 2) / zoomLevel;
  const cy = (selectedNode.height / 2) / zoomLevel;
  // get the new position of the node
  const dx = x - cx - left / zoomLevel - scrollPosition.x;
  const dy = y - cy - top / zoomLevel - scrollPosition.y;
  // find the selected noe to update the position
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
};
/**
 * This funcion handles then mouse up event
 * @param setSelectedNode State management for selected node
 * @param setSelectedNodePosition State management for selected node position
 */
export const handleMouseUp = (setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>, setSelectedNodePosition: React.Dispatch<React.SetStateAction<ScrollPosition | null>>) => {
  // deselect node
  setSelectedNode(null);
  setSelectedNodePosition(null);
};