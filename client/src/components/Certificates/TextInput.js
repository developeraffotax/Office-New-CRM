import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { style } from "../../utlis/CommonStyle";

const TextInput = ({ onAddText }) => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");

  const handleAddText = () => {
    if (text.trim()) {
      onAddText(text, color);
      setText("");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full border mt-2">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Text</h2>
      <div className="mb-4 w-full">
        <div className="inputBox">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${style.input} w-full `}
          />
          <span>Enter Text</span>
        </div>
      </div>
      {/* <div className="mb-4 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Color
        </label>
        <SketchPicker
          color={color}
          onChangeComplete={(newColor) => setColor(newColor.hex)}
          style={{ width: "100%", height: "auto" }}
        />
      </div> */}
      <button
        onClick={handleAddText}
        className="w-full px-4 py-2 bg-blue text-white rounded-md bg-orange-500 hover:bg-orange-600 transition-all duration-200"
      >
        Add Text
      </button>
    </div>
  );
};

export default TextInput;
