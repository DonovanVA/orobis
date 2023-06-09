import { NodeType } from "./UI/Nodes/Defaults/DefaultTypes"
import { defaultNodeConstructor } from "./UI/Nodes/Nodes"
export const sampleNodes = [
    {
        id: "node1",
        width: 50,
        height: 50,
        x: 100,
        y: 100,
        fillStyle: defaultNodeConstructor.fillColor,
        strokeStyle: defaultNodeConstructor.borderColor,
        type: NodeType.ARC,
    },
    {
        id: "node2",
        width: 50,
        height: 50,
        x: 200,
        y: 200,
        fillStyle: defaultNodeConstructor.fillColor,
        strokeStyle: defaultNodeConstructor.borderColor,
        type: NodeType.ARC,
    },
    {
        id: "node3",
        width: 50,
        height: 50,
        x: 300,
        y: 300,
        fillStyle: defaultNodeConstructor.fillColor,
        strokeStyle: defaultNodeConstructor.borderColor,
        type: NodeType.ARC,
    },
    {
        id: "node4",
        width: 50,
        height: 50,
        x: 400,
        y: 400,
        fillStyle: defaultNodeConstructor.fillColor,
        strokeStyle: defaultNodeConstructor.borderColor,
        type: NodeType.ARC,
    },
    {
        id: "node5",
        width: 50,
        height: 50,
        x: 500,
        y: 500,
        fillStyle: defaultNodeConstructor.fillColor,
        strokeStyle: defaultNodeConstructor.borderColor,
        type: NodeType.ARC,
    },
]