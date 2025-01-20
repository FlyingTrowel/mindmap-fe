import FileUpload from '../components/upload/FileUpload';
import MindMapCanvas from '../components/mindmap/MindMapCanvas';

const Create = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Mind Map</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <FileUpload />
        <MindMapCanvas />
      </div>
    </div>
  );
};

export default Create;