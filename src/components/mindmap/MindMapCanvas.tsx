import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router";
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import DownloadButton from "../../pages/DownloadButton";

const MindMapCanvas = () => {
  const [mindMapData, setMindMapData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchMindMapData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/mindmap/${id}`);
        setMindMapData(response.data);
        console.log(response.data);
        
      } catch (error) {
        console.error("Error fetching mind map data:", error);
      }
    };

    fetchMindMapData();
  }, []);

  return (
    <div className="w-full h-[500px] border-2 border-gray-200 rounded-lg p-4">
      <h3 className="text-lg mb-4">Mind Map Canvas</h3>
      <div className="bg-gray-50 h-full flex items-center justify-center">
        {mindMapData ? (
          <div className="w-full h-full">

          <MindMap data={{ data: { mindmap: mindMapData } }} />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

const CustomNode = ({ data }) => {
  console.log(data);

  const [mindMap, setMindMap] = useState(data);

  console.log("MindMap updated:", {...mindMap});
  
  
  return (
  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
    <input
    type="text"
    value={mindMap.label}
    onChange={(e) => {
      const updatedMindMap = { ...mindMap, label: e.target.value };
      setMindMap(updatedMindMap);
      // setMindMap({ ...mindMap, label: e.target.value });
      // setSharedMindMap({...mindMap, label: e.target.value })
    }}
    className="font-medium text-sm mb-2 bg-transparent border-none outline-none"
    style={{ width: `${mindMap.label.length}ch` }}
    />
    {mindMap.keyPoints && (
    <ul className="text-xs text-gray-600 list-disc pl-4">
      {mindMap.keyPoints.map((point, index) => (
      <li key={index} className="list-disc">
        <input
        type="text"
        value={point}
        onChange={(e) => {
          const newKeyPoints = [...mindMap.keyPoints];
          newKeyPoints[index] = e.target.value;
          setMindMap({ ...mindMap, keyPoints: newKeyPoints });
        }}
        className="w-full bg-transparent border-none outline-none"
        style={{ width: `${point.length}ch` }}
        />
      </li>
      ))}
    </ul>
    )}
    {mindMap.keyPointsExplanation && (
    <details className="text-xs text-gray-600 list-disc pl-4">
      <summary>
      <b>Key Points Explanation</b>
      </summary>
      <ul>
      {mindMap.keyPointsExplanation.map((point, index) => (
        <li key={index} className="list-disc">
        <input
          type="text"
          value={point}
          onChange={(e) => {
          const newKeyPointsExplanation = [
            ...mindMap.keyPointsExplanation,
          ];
          newKeyPointsExplanation[index] = e.target.value;
          setMindMap({
            ...mindMap,
            keyPointsExplanation: newKeyPointsExplanation,
          });
          }}
          className="w-full bg-transparent border-none outline-none"
          style={{ width: `${point.length}ch` }}
        />
        </li>
      ))}
      </ul>
    </details>
    )}

    <Handle
    type="source"
    position={Position.Bottom}
    id="a"
    className="opacity-0"
    />
    <Handle
    type="target"
    position={Position.Top}
    id="b"
    className="opacity-0"
    />
  </div>
  );
};


const nodeTypes = {
  custom: CustomNode,
};

const MindMap = ({ data }) => {
  console.log(data);
  const { mindMap } = data.data.mindmap.data;

  console.log(mindMap);
  

  const createInitialNodes = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = 300;

    const rootNode = {
      id: "root",
      type: "custom",
      position: { x: centerX, y: centerY },
      data: { label: mindMap.title },
    };

    const nodes = mindMap.nodes.map((node, index) => {
      // console.log(node.keyPoints);

      const angle = (2 * Math.PI * index) / mindMap.nodes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        id: node.id,
        type: "custom",
        position: { x, y },
        data: {
          label: node.title,
          keyPoints: node.content.keyPoints,
          keyPointsExplanation: node.content.keyPointsExplanation,
        },
      };
    });

    return [rootNode, ...nodes];
  };

  const createInitialEdges = () => {
    // console.log(...mindMap.nodes);

    const edges = [];

    mindMap.nodes.forEach((node) => {
      edges.push({
        id: `eroot-${node.id}`,
        source: "root",
        target: node.id,
        markerEnd: { type: MarkerType.Arrow },
        type: "straight",
        animated: true,
        style: { stroke: "#93c5fd" },
      });
    });

    return edges;

  };

  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges());

  return (
    <div className="flex-1 w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-blue-50"
      >
        <Background color="#93c5fd" gap={16} />
        <Controls />
        <DownloadButton />
      </ReactFlow>
    </div>
  );
};

export default MindMapCanvas;
