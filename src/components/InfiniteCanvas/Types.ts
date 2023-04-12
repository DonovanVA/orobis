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
}

export interface Edge {
  from: string;
  to: string;
  weight:number;
}

export interface InfiniteCanvasProps {
  width: number;
  height: number;
}

export interface Dot{
  x:number
  y:number
  radius:number
}