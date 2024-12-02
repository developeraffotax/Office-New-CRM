import React, { useState, useEffect } from "react";

const TextAdjustments = ({ selectedText, onUpdateText }) => {
  const [textContent, setTextContent] = useState(selectedText.text);
  const [fontSize, setFontSize] = useState(selectedText.fontSize);
  const [fontFamily, setFontFamily] = useState(selectedText.fontFamily);
  const [fill, setFill] = useState(selectedText.fill);

  // Update local state when selectedText changes
  useEffect(() => {
    setTextContent(selectedText.text);
    setFontSize(selectedText.fontSize);
    setFontFamily(selectedText.fontFamily);
    setFill(selectedText.fill);
  }, [selectedText]);

  // Handlers for changes
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setTextContent(newText);
    onUpdateText({ ...selectedText, text: newText });
  };

  const handleFontSizeChange = (e) => {
    const newFontSize = parseInt(e.target.value, 10);
    setFontSize(newFontSize);
    onUpdateText({ ...selectedText, fontSize: newFontSize });
  };

  const handleFontFamilyChange = (e) => {
    const newFontFamily = e.target.value;
    setFontFamily(newFontFamily);
    onUpdateText({ ...selectedText, fontFamily: newFontFamily });
  };

  const handleFillChange = (e) => {
    const newFill = e.target.value;
    setFill(newFill);
    onUpdateText({ ...selectedText, fill: newFill });
  };

  return (
    <div className="absolute top-0 right-0 m-4 p-4 bg-white shadow-md rounded-md">
      <h3 className="text-lg font-semibold mb-2">Text Adjustments</h3>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Text Content
          </label>
          <input
            type="text"
            value={textContent}
            onChange={handleTextChange}
            className="mt-1 block w-full p-1 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Size
          </label>
          <input
            type="number"
            value={fontSize}
            onChange={handleFontSizeChange}
            className="mt-1 block w-full p-1 border border-gray-300 rounded-md"
            min={10}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={handleFontFamilyChange}
            className="mt-1 block w-full p-1 border border-gray-300 rounded-md"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Courier New">Courier New</option>
            {/* Add more font options as needed */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Text Color
          </label>
          <input
            type="color"
            value={fill}
            onChange={handleFillChange}
            className="mt-1 block w-full h-10 p-1 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default TextAdjustments;
