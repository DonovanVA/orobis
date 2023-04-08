import { Node } from "./Types";

export const checkCollision = (selectedNode: Node, nodes: Node[], dimheight: number, dimwidth: number) => {
  selectedNode.x <= 5 && (selectedNode.x = 5);
  selectedNode.y <= 5 && (selectedNode.y = 5);
  selectedNode.x >= dimwidth - selectedNode.width && (selectedNode.x = dimwidth - selectedNode.width - 5);
  selectedNode.y >= dimheight - selectedNode.height && (selectedNode.y = dimheight - selectedNode.height - 5);

  const collidedNode = nodes
    .find((neighbourNode: Node) => {
      return (
        neighbourNode.id !== selectedNode.id &&
        selectedNode.x + selectedNode.width > neighbourNode.x &&
        selectedNode.y + selectedNode.height > neighbourNode.y &&
        selectedNode.x < neighbourNode.x + neighbourNode.width &&
        selectedNode.y < neighbourNode.y + neighbourNode.height)
    })
   // If there is a collided node, prevent the selected node from overlapping it
   if (collidedNode) {
    const xOverlap = Math.min(selectedNode.x + selectedNode.width, collidedNode.x + collidedNode.width) - Math.max(selectedNode.x, collidedNode.x);
    const yOverlap = Math.min(selectedNode.y + selectedNode.height, collidedNode.y + collidedNode.height) - Math.max(selectedNode.y, collidedNode.y);

    if (xOverlap < yOverlap) {
      if (selectedNode.x < collidedNode.x) {
        selectedNode.x = collidedNode.x - selectedNode.width;
      } else {
        selectedNode.x = collidedNode.x + collidedNode.width;
      }
    } else {
      if (selectedNode.y < collidedNode.y) {
        selectedNode.y = collidedNode.y - selectedNode.height;
      } else {
        selectedNode.y = collidedNode.y + collidedNode.height;
      }
    }
  }

};