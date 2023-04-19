import { useState, useRef, memo, useLayoutEffect } from "react";
import styled from "styled-components";
import {
  handleKeyDown,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
} from "./Controls";
import { InfiniteCanvasProps, Position } from "./Types";
import { Edge } from "./UI/Edges/Defaults/DefaultTypes";
import { Node, NodeType } from "./UI/Nodes/Defaults/DefaultTypes";
import { drawEdges, drawNodes } from "./Utils";
import { edgeColors } from "./UI/Edges/Edges";
import { findCycle } from "./Algorithms";
import { sampleNodes } from "./samples";
const Canvas = styled.canvas`
  -webkit-font-smoothing: antialiased; /* subpixel-antialiased and others... */
  -webkit-filter: blur(0px);
  -webkit-perspective: 1000;
  filter: blur(0px);
`;
interface CanvasContextType {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedNodePosition: Position | null;
  selecting: boolean;
  drawingEdge: boolean;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  setSelectedNodePosition: React.Dispatch<
    React.SetStateAction<Position | null>
  >;
  setDrawingEdge: React.Dispatch<React.SetStateAction<boolean>>;
}

export function InfiniteCanvas({ width, height }: InfiniteCanvasProps) {
  // 1. refactor 
  // 2. manage application state
  // 3. boundary box for nodes
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>(sampleNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedNodePosition, setSelectedNodePosition] =
    useState<Position | null>(null);
  const [drawingEdge, setDrawingEdge] = useState<boolean>(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isHighResolution = window.matchMedia(
      "(min-resolution: 2dppx), (min-device-pixel-ratio: 2)"
    ).matches;

    // Increase canvas resolution
    const ratio = isHighResolution ? 1.3 : 1;
    window.devicePixelRatio = ratio;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;

    // Scale down using CSS
    canvas.style.width = canvas.offsetWidth + "px";
    canvas.style.height = canvas.offsetHeight + "px";

    // Set transform to scale by ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the edges with arrowheads
    if (findCycle(nodes, edges)) {
      drawEdges(
        nodes,
        edges,
        selectedEdge,
        ctx,
        edgeColors.defaultEdgeStrokeStyle,
        edgeColors.selectedEdgeColor
      );
    } else {
      drawEdges(
        nodes,
        edges,
        selectedEdge,
        ctx,
        edgeColors.NonCycleColor,
        edgeColors.selectedEdgeColor
      );
    }

    // Draw the nodes
    drawNodes(nodes, ctx);

    const eventListener = (e: KeyboardEvent) =>
      handleKeyDown(e, nodes, selectedNode, setNodes, setSelectedNode);
    document.addEventListener("keydown", eventListener);
    //return () => document.removeEventListener("keydown", eventListener);
  }, [selectedNode, nodes, edges, selectedEdge]);

  return (
    <Canvas
      id="my-canvas"
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={(e) =>
        handleMouseDown(
          e,
          canvasRef,
          nodes,
          edges,
          selectedNode,
          selectedEdge,
          setSelectedEdge,
          setNodes,
          setSelectedNodePosition,
          setSelectedNode,
          setDrawingEdge
        )
      }
      onMouseMove={(e) =>
        handleMouseMove(
          e,
          canvasRef,
          nodes,
          edges,
          selectedEdge,
          selectedNode,
          selectedNodePosition,
          drawingEdge,
          setNodes,
          setSelectedNodePosition,
          setSelectedNode,
          height,
          width
        )
      }
      onMouseUp={(e) =>
        handleMouseUp(
          e,
          canvasRef,
          nodes,
          edges,
          selectedNode,
          drawingEdge,
          setSelectedNode,
          setSelectedNodePosition,
          setDrawingEdge,
          setEdges
        )
      }
    />
  );
}

export default memo(InfiniteCanvas);
