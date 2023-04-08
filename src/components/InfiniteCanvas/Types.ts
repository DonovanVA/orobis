export interface Position {
  x: number;
  y: number;
}
export interface ScrollPosition extends Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  fillStyle: string;
  stokeStyle: string;
}
export interface InfiniteCanvasProps {
  width: number;
  height: number;
}
