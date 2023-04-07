import React, { useRef, useState, useEffect } from "react";

export interface Object {
  id: number;
  x: number;
  y: number;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>();
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [objects, setObjects] = useState<Object[]>([]);
  const [selectedObject, setSelectedObject] = useState<Object | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const renderCtx = canvas.getContext("2d");
      if (renderCtx) {
        setContext(renderCtx);
        drawCanvas(renderCtx);
      }
    }
  }, []);

  useEffect(() => {
    if (context) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      drawCanvas(context);
      drawObjects(context);
    }
  }, [context, pan, scale]);
  const drawCanvas = (context: CanvasRenderingContext2D) => {
    const dotSize = 2; // increase dot size for better visibility
    const dotSpacing = 20; // set the spacing between the dots

    for (let i = dotSpacing / 2; i < 800; i += dotSpacing) {
      for (let j = dotSpacing / 2; j < 800; j += dotSpacing) {
        context.fillStyle = "#2F3434";
        context.fillRect(i, j, dotSize, dotSize);
      }
    }
    for (const obj of objects) {
      context.fillStyle = "red";
      context.fillRect(obj.x, obj.y, 50, 50);
    }
  };
  const drawObjects = (context: CanvasRenderingContext2D) => {
    context.save();
    context.translate(pan.x, pan.y);
    context.scale(scale, scale);
    // Draw on canvas here
    context.fillStyle = "red";
    context.fillRect(0, 0, 50, 50);
    context.restore();
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault(); // disable zooming when the cursor is in the canvas
    const zoomFactor = 1 + event.deltaY * 0.01;

    if (event.deltaY > 0 && scale <= 40) {
      setScale((prevScale) => prevScale * zoomFactor);
    } else if (event.deltaY < 0 && scale > 1) {
      setScale((prevScale) => prevScale * zoomFactor);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const clickedObject = objects.find((obj) => {
      const rect = { x: obj.x, y: obj.y, width: 50, height: 50 };
      return (
        event.clientX >= rect.x &&
        event.clientX <= rect.x + rect.width &&
        event.clientY >= rect.y &&
        event.clientY <= rect.y + rect.height
      );
    });
    setSelectedObject(clickedObject ?? null);
    setIsDragging(true);
    setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && context) {
      const newX = event.clientX - dragStart.x;
      const newY = event.clientY - dragStart.y;
      if (selectedObject) {
        selectedObject.x = newX;
        selectedObject.y = newY;
        setObjects((prevObjects) => [...prevObjects]);
      } else {
        setPan({ ...pan, x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedObject(null);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <canvas
      ref={canvasRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      height={800}
      width={800}
    />
  );
}
