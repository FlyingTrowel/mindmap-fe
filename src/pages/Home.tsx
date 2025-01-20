import { useState } from 'react';
import { 
  ReactFlow,
  Background, 
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const PDFUploader = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Please select a PDF file');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            console.log(data);
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                            loading 
                                ? 'bg-gray-400'
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white`}
                    >
                        {loading ? 'Processing...' : 'Upload PDF'}
                    </button>
                </div>

                {error && (
                    <div className="text-red-500 mt-2 text-center">
                        {error}
                    </div>
                )}
            </div>

            {result && <MindMap data={result} />}
        </div>
    );
};

const MindMap = ({ data }) => {
    console.log(data);
    const { mindMap } = data.data.mindmap;
    
    // Custom Node Component
    const CustomNode = ({ data }) => {
        return (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                <h3 className="font-medium text-sm mb-2">{data.label}</h3>
                {data.description && (
                    <p className="text-xs text-gray-600 overflow-hidden text-ellipsis">
                        {/* {data.description.slice(0, 100)}... */}
                        {data.description}
                    </p>
                )}
            </div>
        );
    };

    const nodeTypes = {
        custom: CustomNode
    };

    // Create nodes with positions
    const createInitialNodes = () => {
        const centerX = window.innerWidth / 2;
        const centerY = 100;
        const radius = 300;
        
        return mindMap.nodes.map((node, index) => {
            // Calculate position in a radial layout
            const angle = (2 * Math.PI * index) / mindMap.nodes.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // If it's the first node (main topic), place it in the center
            const position = index === 0 
                ? { x: centerX, y: 50 }
                : { x, y };

            return {
                id: node.id,
                type: 'custom',
                position,
                data: { 
                    label: node.title,
                    description: node.description
                }
            };
        });
    };

    // Create edges connecting nodes
    const createInitialEdges = () => {
        return mindMap.nodes.slice(1).map((node, index) => ({
            id: `e1-${index + 2}`,
            source: mindMap.nodes[0].id,
            target: node.id,
            markerEnd: { type: MarkerType.Arrow },
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#93c5fd' }
        }));
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
            </ReactFlow>
        </div>
    );
};

export default PDFUploader;