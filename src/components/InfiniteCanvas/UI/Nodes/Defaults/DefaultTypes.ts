export enum NodeType {
    RECT = "RECT",
    ARC = "ARC"
}
export interface Node {
    id: string;
    width: number;
    height: number;
    x: number;
    y: number;
    fillStyle: string;
    strokeStyle: string;
    type: NodeType;
}
