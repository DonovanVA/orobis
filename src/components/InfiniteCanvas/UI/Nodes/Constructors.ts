import { Node } from "./Defaults/DefaultTypes";
export function ConstructRect(ctx: CanvasRenderingContext2D, node: Node) {
    ctx.fillStyle = node.fillStyle;
    ctx.fillRect(node.x, node.y, node.width, node.height);
    ctx.strokeStyle = node.strokeStyle;
    ctx.strokeRect(node.x, node.y, node.width, node.height);
    ctx.beginPath();
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(node.id, node.x + node.width / 2, node.y + node.height / 2);
}


export function ConstructArc(ctx: CanvasRenderingContext2D, node: Node) {
    ctx.beginPath();
    ctx.arc(node.x + node.width / 2, node.y + node.height / 2, node.width / 2, 0, 2 * Math.PI);
    ctx.fillStyle = node.fillStyle;
    ctx.fill();
    ctx.strokeStyle = node.strokeStyle;
    ctx.stroke();
    ctx.beginPath();
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(node.id, node.x + node.width / 2, node.y + node.height / 2);
}