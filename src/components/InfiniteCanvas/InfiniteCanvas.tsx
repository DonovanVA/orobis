import { useState, useRef, useEffect, memo } from "react";
import styled from "styled-components";
import {
  handleScroll,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
} from "./Controls";
import { ScrollPosition, InfiniteCanvasProps, Node } from "./Types";
const Canvas = styled.canvas``;

const InfiniteCanvas = ({ width, height }: InfiniteCanvasProps) => {
  const MAX_ZOOM_LEVEL = 5; // Set your maximum zoom level here
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const prevScrollPosition = useRef<ScrollPosition>({ x: 0, y: 0 });
  const prevZoomLevel = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "node1",
      width: 50,
      height: 50,
      x: 100,
      y: 100,
      fillStyle: "#FFFFFF",
      stokeStyle: "#000000",
    },
    {
      id: "node2",
      width: 50,
      height: 50,
      x: 200,
      y: 200,
      fillStyle: "#FFFFFF",
      stokeStyle: "#000000",
    },
  ]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodePosition, setSelectedNodePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [shouldUpdateCanvas, setShouldUpdateCanvas] = useState(false);
  const [selecting, setSelecting] = useState(false);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the grid

    // Draw the nodes
    nodes.forEach((node) => {
      ctx.fillStyle = node.fillStyle;
      ctx.fillRect(node.x, node.y, node.width, node.height);
      ctx.strokeStyle = node.stokeStyle;
      ctx.strokeRect(node.x, node.y, node.width, node.height);
    });
  }, [scrollPosition, zoomLevel, selectedNode, nodes]);

  useEffect(() => {
    prevScrollPosition.current = scrollPosition;
  }, [scrollPosition]);

  useEffect(() => {
    prevZoomLevel.current = zoomLevel;
  }, [zoomLevel]);

  return (
    <Canvas
      id="my-canvas"
      ref={canvasRef}
      width={width}
      height={height}
      onScroll={(e) => handleScroll(e, setScrollPosition)}
      onWheel={handleWheel}
      onMouseDown={(e) =>
        handleMouseDown(
          e,
          canvasRef,
          zoomLevel,
          scrollPosition,
          nodes,
          selecting,
          setSelecting,
          setNodes,
          setSelectedNodePosition,
          setSelectedNode
        )
      }
      onMouseMove={(e) =>
        handleMouseMove(
          e,
          canvasRef,
          zoomLevel,
          scrollPosition,
          nodes,
          selectedNode,
          selectedNodePosition,
          setNodes,
          setSelectedNodePosition,
          setSelectedNode,
          height,
          width
        )
      }
      onMouseUp={() => handleMouseUp(setSelectedNode, setSelectedNodePosition)}
    />
  );
};

export default InfiniteCanvas;
