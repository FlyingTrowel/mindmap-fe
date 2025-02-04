import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';

const View = () => {
  const [mindMaps, setMindMaps] = useState([]);

  useEffect(() => {
    const fetchMindMaps = async () => {
      try {
        const response = await axios.get('http://localhost:3000/mindmaps');
        console.log(response.data);
        
        setMindMaps(response.data.data);
      } catch (error) {
        console.error('Error fetching mind maps:', error);
      }
    };

    fetchMindMaps();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">View Mind Maps</h1>
      <ul>
        {mindMaps && mindMaps.map((mindMap) => (
          <li key={mindMap._id} className="mb-2 p-2 border rounded">
            <Link to={`/mindmap/${mindMap._id}`}>
              <h2 className="text-xl font-semibold">{mindMap.mindMap.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default View;