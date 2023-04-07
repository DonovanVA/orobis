import { useState, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Connection,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "Hello" },
    position: { x: 100, y: 100 },
    type: "input",
  },
  {
    id: "2",
    data: { label: "World" },
    position: { x: 100, y: 100 },
  },
];

const initialEdges: Edge[] = [];

export default function AutomataBlueprint() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      const newHistory = history.slice(0, currentStep + 1);
      setHistory([...newHistory, { nodes: newNodes, edges }]);
      setCurrentStep(newHistory.length);
      setNodes(newNodes);
    },
    [currentStep, history, edges, nodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      const newHistory = history.slice(0, currentStep + 1);
      setHistory([...newHistory, { nodes, edges: newEdges }]);
      setCurrentStep(newHistory.length);
      setEdges(newEdges);
    },
    [currentStep, history, edges, nodes]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const undo = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setNodes(history[currentStep - 1].nodes);
      setEdges(history[currentStep - 1].edges);
    }
  }, [currentStep, history]);

  const redo = useCallback(() => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      setNodes(history[currentStep + 1].nodes);
      setEdges(history[currentStep + 1].edges);
    }
  }, [currentStep, history]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ width: "100%", height: "80%" }}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
}
