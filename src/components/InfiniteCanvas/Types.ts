export interface Position {
  x: number;
  y: number;
}
export interface InfiniteCanvasProps {
  width: number;
  height: number;
}

export interface ScrollPosition extends Position {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}