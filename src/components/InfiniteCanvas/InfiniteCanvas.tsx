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
import { crossProduct, drawEdges, drawNodes } from "./Utils";
import { calculateArrowCoords } from "./Utils";
const Canvas = styled.canvas`
-webkit-font-smoothing: antialiased; /* subpixel-antialiased and others... */
-webkit-filter: blur(0px);
-webkit-perspective: 1000;
filter: blur(0px);
`;

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
      strokeStyle: "#000000",
      edges: [{ from: "node1", to: "node2" }],
    },
    {
      id: "node2",
      width: 50,
      height: 50,
      x: 200,
      y: 200,
      fillStyle: "#FFFFFF",
      strokeStyle: "#000000",
      edges: [{ from: "node1", to: "node2" }],
    },
    {
      id: "node3",
      width: 50,
      height: 50,
      x: 300,
      y: 300,
      fillStyle: "#FFFFFF",
      strokeStyle: "#000000",
      edges: [{ from: "node3", to: "node2" }],
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
    window.devicePixelRatio=2; 
  
  
    
    if (!ctx) return;
    
    // Increase canvas resolution
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    
    // Scale down using CSS
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
    
    // Set transform to scale by ratio
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the edges with arrowheads
    drawEdges(nodes, ctx);

    // Draw the nodes
    drawNodes(nodes, ctx);
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
