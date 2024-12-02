import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

const FilesUploader = ({ onImageUpload }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Unsupported file type. Please upload a PDF file.");
      setError("Unsupported file type. Please upload a PDF file.");
      return;
    }

    // Validate file size
    const maxSizeInBytes = 20 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError("File size exceeds the 20MB limit.");
      return;
    }

    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      onImageUpload(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border hover:drop-shadow-md">
      <h2 className="text-ld font-semibold text-gray-800 mb-4">Upload File</h2>
      <label className="block">
        <span className="sr-only font-medium">Choose File</span>
        <input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-orange-600 file:text-white
            hover:file:bg-orange-700
            focus:outline-none"
        />
      </label>
      <p className="mt-2 text-sm text-gray-600">Upload File from your device</p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FilesUploader;
