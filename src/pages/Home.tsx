import { useState, createContext, useContext, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DownloadButton from "./DownloadButton";


export const MindMapContext = createContext(null);

const PDFUploader = () => {
  // console.log(test);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sharedMindMap, setSharedMindMap] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a PDF file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      } else {
        console.log("File uploaded successfully");
      }

      console.log(data);
      setResult(data);
      setSharedMindMap(data?.data?.mindmap);
    } catch (err) {
      setError(err.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

const handleSave = async () => {
	if (!sharedMindMap) {
		setError("No mindmap data to save");
		return;
	}

	console.log("Saving sharedMindMap:", JSON.stringify(sharedMindMap));

	setSaving(true);
	setError(null);

	try {
		const response = await fetch("http://localhost:3000/save", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(sharedMindMap),
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || "Save failed");
		}

		console.log("Mindmap saved successfully");
	} catch (err) {
		setError(err.message || "Failed to save mindmap");
		console.log(err);
	} finally {
		setSaving(false);
	}
};

  return (
    <MindMapContext.Provider value={{ sharedMindMap, setSharedMindMap }}>
      <div className="w-full h-screen flex flex-col">
        <div className="p-4 border-b">
          <div className="max-w-md mx-auto flex gap-4 items-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="flex-1"
            />
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-4 py-2 rounded ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {loading ? "Processing..." : "Upload PDF"}
            </button>
          </div>

          {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
        </div>

        {result?.data?.success ? (
          <>
            <MindMap data={result} />
            <div className="fixed bottom-4 right-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-full shadow-lg ${
                saving ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          </>
        ) : (
          <div className="text-red-500 mt-2 text-center">
            {result?.data?.error}
          </div>
        )}

      </div>
    </MindMapContext.Provider>
  );
};

const CustomNode = ({ data }) => {
  console.log(data);

  const [mindMap, setMindMap] = useState(data);
  const { sharedMindMap, setSharedMindMap } = useContext(MindMapContext);

//   useEffect(() => {
//     // Merge local changes into sharedMindMap here, then call setSharedMindMap(...)
//   }, [mindMap, sharedMindMap, setSharedMindMap]);

//   useEffect(() => {
//     // Load node details into local mindMap if sharedMindMap changes
//     if (!sharedMindMap || !data?.id) return;
//     const node = sharedMindMap.mindMap.nodes.find(n => n.id === data.id);
//     if (node) {
//       setMindMap({
//         ...mindMap,
//         label: node.title,
//         keyPoints: node.content.keyPoints,
//         keyPointsExplanation: node.content.keyPointsExplanation,
//       });
//     }
//   }, [sharedMindMap, data?.id]);

  useEffect(() => {
    // // Push local changes into sharedMindMap
    // if (!sharedMindMap || !mindMap.id) return;
    // const updated = { ...sharedMindMap };
    // const idx = updated.mindMap.nodes.findIndex(n => n.id === mindMap.id);
    // if (idx !== -1) {
    //   updated.mindMap.nodes[idx].title = mindMap.label;
    //   updated.mindMap.nodes[idx].content.keyPoints = mindMap.keyPoints;
    //   updated.mindMap.nodes[idx].content.keyPointsExplanation =
    //     mindMap.keyPointsExplanation;
    //   setSharedMindMap(updated);
    // }

	console.log("MindMap updated:", {...mindMap});
	console.log("SharedMindMap:", sharedMindMap);
	
	// setSharedMindMap(mindMap);
	// console.log("SharedMindMap:", sharedMindMap);
	
	
  }, [mindMap, setMindMap]);

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
  const { sharedMindMap, setSharedMindMap } = useContext(MindMapContext);
  const { mindMap } = data.data.mindmap;

  useEffect(() => {
    if (!sharedMindMap) {
      setSharedMindMap(data?.data?.mindmap);
    }
  }, [sharedMindMap, data, setSharedMindMap]);

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
    <div className="flex-1">
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

export default PDFUploader;
