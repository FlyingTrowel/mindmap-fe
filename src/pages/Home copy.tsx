import { useState } from 'react';

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

            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="mb-4">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mb-2"
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
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            {result && <MindMap data={result} />}

            {result && (
                <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-bold mb-2">Results:</h3>
                    <pre className="whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

const MindMapNode = ({ node, allNodes }) => {
    const [isExpanded, setIsExpanded] = useState(true);
  
    const toggleExpand = () => {
      setIsExpanded(!isExpanded);
    };
  
    return (
      <div style={{ marginLeft: 20 }}>
        <div onClick={toggleExpand} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          {node.title} {isExpanded ? '-' : '+'}
        </div>
        {isExpanded && (
          <div>
            <p><strong>Description:</strong> {node.description}</p>
            <p><strong>Original Text:</strong> {node.unchangedText}</p>
            {node.references && node.references.length > 0 && (
              <div>
                <strong>References:</strong>
                <ul>
                  {node.references.map((ref, index) => (
                    <li key={index}>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {node.children && node.children.length > 0 && (
              <div>
                {node.children.map(childId => (
                  <MindMapNode key={childId} node={allNodes[childId]} allNodes={allNodes} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const MindMap = ({ data }) => {
    const { mindMap } = data;
    console.log(data.data.mindmap.mindMap);
    console.log(data);
    
    const nodesById = Object.fromEntries(data.data.mindmap.mindMap.nodes.map(node => [node.id, node]));
  
    return (
      <div>
        <h1>{data.data.mindmap.mindMap.title}</h1>
        {data.data.mindmap.mindMap.nodes.map(node => (
          node.id === data.data.mindmap.mindMap.nodes[0].id && (
            <MindMapNode key={node.id} node={node} allNodes={nodesById} />
          )
        ))}
      </div>
    );
  };

export default PDFUploader;