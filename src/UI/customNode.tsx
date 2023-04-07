import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

const handleStyle = { left: 10 };

export function customNode({ data }:{data:any}) {
  const onChange = useCallback((event:any) => {
    console.log(event.target.value);
  }, []);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" onChange={onChange} className="nodrag" />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
    </>
  );
}