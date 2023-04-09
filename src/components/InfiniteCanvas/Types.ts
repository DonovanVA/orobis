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
  strokeStyle: string;
  edges: Edge[];
}

export interface Edge {
  from: string;
  to: string;
}

export interface InfiniteCanvasProps {
  width: number;
  height: number;
}

export interface Dot{
  x:number
  y:number
}