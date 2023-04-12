import { useState, useRef, useEffect, memo, useLayoutEffect } from "react";
import styled from "styled-components";
import { handleMouseDown, handleMouseMove, handleMouseUp } from "./Controls";
import {
  ScrollPosition,
  InfiniteCanvasProps,
  Node,
  Position,
  Edge,
} from "./Types";
import { drawEdges, drawNodes } from "./Utils";
import { colors } from "./UI";
import _ from "lodash";
import { findCycle } from "./Algorithms";
const Canvas = styled.canvas`
  -webkit-font-smoothing: antialiased; /* subpixel-antialiased and others... */
  -webkit-filter: blur(0px);
  -webkit-perspective: 1000;
  filter: blur(0px);
`;

const InfiniteCanvas = ({ width, height }: InfiniteCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "node1",
      width: 50,
      height: 50,
      x: 100,
      y: 100,
      fillStyle: "#FFFFFF",
      strokeStyle: "#000000",
    },
    {
      id: "node2",
      width: 50,
      height: 50,
      x: 200,
      y: 200,
      fillStyle: "#FFFFFF",
      strokeStyle: "#000000",
    },
    {
      id: "node3",
      width: 50,
      height: 50,
      x: 300,
      y: 300,
      fillStyle: "#FFFFFF",
      strokeStyle: "#000000",
    },
    {
      id: "node4",
      width: 50,
      height: 50,
      x: 400,
      y: 400,
      fillStyle: "#FFFFFF",
      strokeStyle: "#000000",
    },
    {
      id: "node5",
      width: 50,
      height: 50,
      x: 500,
      y: 500,
      fillStyle: "#FFFFFF",
      strokeStyle: "#000000",
    },
  ]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodePosition, setSelectedNodePosition] =
    useState<Position | null>(null);
  const [shouldUpdateCanvas, setShouldUpdateCanvas] = useState<boolean>(false);
  const [selecting, setSelecting] = useState<boolean>(false);
  const [drawingEdge, setDrawingEdge] = useState<boolean>(false);
  useEffect(() => {
    let animationFrameId: number;

    const handleUpdateCanvas = () => {
      animationFrameId = requestAnimationFrame(() => {
        setShouldUpdateCanvas(true);
      });
    };

    const handleAnimationFrame = () => {
      if (shouldUpdateCanvas) {
        setShouldUpdateCanvas(false);
        // update the canvas here
      }

      animationFrameId = requestAnimationFrame(handleAnimationFrame);
    };

    animationFrameId = requestAnimationFrame(handleAnimationFrame);

    // Add an event listener to the window object to prevent the default behavior of the mouse wheel event

    return () => {
      cancelAnimationFrame(animationFrameId);
      // Remove the event listener when the component unmounts
    };
  }, [shouldUpdateCanvas]);
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
      drawEdges(nodes, edges, ctx, colors.defaultEdgeStrokeStyle);
    } else {
      drawEdges(nodes, edges, ctx, colors.NonCycleColor);
    }

    // Draw the nodes
    drawNodes(nodes, ctx);
  }, [selectedNode, nodes, edges]);

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
          selecting,
          setSelecting,
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
          selectedNode,
          selectedNodePosition,
          setNodes,
          setSelectedNodePosition,
          setSelectedNode,
          drawingEdge,
          height,
          width
        )
      }
      onMouseUp={(e) =>
        handleMouseUp(
          e,
          selectedNode,
          setSelectedNode,
          setSelectedNodePosition,
          drawingEdge,
          setDrawingEdge,
          nodes,
          edges,
          setEdges
        )
      }
    />
  );
};

export default memo(InfiniteCanvas);
