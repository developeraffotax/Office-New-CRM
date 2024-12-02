import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignaturePad = ({ onSave }) => {
  const sigCanvas = useRef(null);

  const handleSave = () => {
    const dataUrl = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    sigCanvas.current?.clear();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Signature
      </label>
      <div className="border rounded-md mb-2">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: "sigCanvas",
          }}
        />
      </div>
      <div className="w-full flex items-center justify-end gap-4">
        <button
          onClick={handleClear}
          className="text-[14px] px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className=" text-[14px] px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
