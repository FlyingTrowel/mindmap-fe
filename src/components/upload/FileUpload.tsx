import React, { useState } from 'react';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // TODO: Implement file upload logic
      console.log('Uploading file:', selectedFile.name);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl mb-4">Upload PDF</h2>
      <input 
        type="file" 
        accept=".pdf"
        onChange={handleFileChange}
        className="mb-4 w-full"
      />
      <button 
        onClick={handleUpload}
        disabled={!selectedFile}
        className="w-full bg-blue-500 text-white p-2 rounded 
                   hover:bg-blue-600 disabled:bg-gray-300"
      >
        Upload
      </button>
    </div>
  );
};

export default FileUpload;