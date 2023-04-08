import { RefObject } from "react";
import { Position, ScrollPosition, Node, InfiniteCanvasProps } from "./Types";
import { checkCollision } from "./Utils";


export const handleScroll = (event: React.UIEvent<HTMLCanvasElement>, setScrollPosition: React.Dispatch<ScrollPosition>) => {
  const { scrollLeft, scrollTop } = event.currentTarget;
  setScrollPosition({ x: scrollLeft, y: scrollTop });
};
export const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {

};

export const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>, canvasRef: RefObject<HTMLCanvasElement>, zoomLevel: number, scrollPosition: ScrollPosition, nodes: Node[], selecting: boolean,
  setSelecting: React.Dispatch<React.SetStateAction<boolean>>, setNodes: React.Dispatch<React.SetStateAction<Node[]>>, setSelectedNodePosition: React.Dispatch<React.SetStateAction<ScrollPosition | null>>, setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>) => {
  if (event.button !== 0) return;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const { left, top } = canvas.getBoundingClientRect();
  const x = zoomLevel !== 0 ? (event.clientX - left) / zoomLevel + scrollPosition.x : 0.2;
  const y = zoomLevel !== 0 ? (event.clientY - top) / zoomLevel + scrollPosition.y : 0.2;
  const node = nodes.find(
    (n) => x >= n.x && x <= n.x + n.width && y >= n.y && y <= n.y + n.height
  );
  // have not selected and there is a node to be selected

  // have selected and there is a node selected
  if (node) {
    const updatingNodes = nodes.map((n) =>
      n.stokeStyle !== "#000000" ? { ...n, stokeStyle: "#000000" } : n
    )
    const updatedNodes = updatingNodes.map((n) =>
      n.id === node.id ? { ...n, stokeStyle: "#0000FF" } : n
    );
    setSelecting(true)
    setNodes(updatedNodes);
    setSelectedNode(node);
    setSelectedNodePosition({ x, y });
  }
  //selected but there is no node
  if (selecting && !node) {
    setSelecting(false);
    const updatedNodes = nodes.map((n) =>
      n.stokeStyle !== "#000000" ? { ...n, stokeStyle: "#000000" } : n
    )
    setNodes(updatedNodes);
  }
};
export const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>, canvasRef: RefObject<HTMLCanvasElement>, zoomLevel: number, scrollPosition: ScrollPosition, nodes: Node[]
  , selectedNode: Node | null, selectedNodePosition: Position | null, setNodes: React.Dispatch<React.SetStateAction<Node[]>>, setSelectedNodePosition: React.Dispatch<React.SetStateAction<ScrollPosition | null>>, setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>, dimheight: number, dimwidth: number) => {
  if (!selectedNode || !selectedNodePosition) return;
  const canvas = canvasRef.current;
  if (!canvas) return;
  const { left, top } = canvas.getBoundingClientRect();
  const x = zoomLevel !== 0 ? (event.clientX - left) / zoomLevel + scrollPosition.x : 0.2;
  const y = zoomLevel !== 0 ? (event.clientY - top) / zoomLevel + scrollPosition.y : 0.2;
  const dx = x - selectedNodePosition.x;
  const dy = y - selectedNodePosition.y;
  const newNodes = [...nodes];
  const nodeIndex = newNodes.findIndex((n) => n.id === selectedNode.id);

  if (nodeIndex >= 0) {
    setNodes((prevNodes) => {
      const newNodes = [...prevNodes];
      const nodeIndex = newNodes.findIndex((n) => n.id === selectedNode.id);
      const node = newNodes[nodeIndex];
      newNodes[nodeIndex] = { ...node, x: node.x + dx, y: node.y + dy };
      checkCollision(newNodes[nodeIndex], newNodes, dimheight, dimwidth)
      return newNodes;
    });
    setSelectedNode(nodes[nodeIndex]);
    setSelectedNodePosition({ x, y });
  }
};

export const handleMouseUp = (setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>, setSelectedNodePosition: React.Dispatch<React.SetStateAction<ScrollPosition | null>>) => {
  setSelectedNode(null);
  setSelectedNodePosition(null);
};