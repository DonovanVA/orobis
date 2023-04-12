import { Edge, Node } from "./Types";
export function findCycle(nodes: Node[], edges: Edge[]) {
  let visited = new Array(nodes.length).fill(0);
  let cycle = false;
  edges.map((edge: Edge, edgeIndex: number) => {
    const fromIndex = nodes.findIndex((node: Node) => node.id === edge.from);
    const toIndex = nodes.findIndex((node: Node) => node.id === edge.to);
    if (visited[toIndex] === 1 && visited[fromIndex] === 1) {
      cycle = true;
      return;
    } else {
      visited[toIndex] = 1;
    }
  });

  return cycle;
}
