import React, { useState, useRef } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import toast from "react-hot-toast";

const PdfViewer = ({ file }) => {
  const [hasError, setHasError] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const canvasRef = useRef(null);

  const defaultLayout = defaultLayoutPlugin();
  const fileUrl = file;

  if (!fileUrl || !fileUrl.startsWith("data:application/pdf")) {
    return <p>Please provide a valid PDF file</p>;
  }

  // Handle drawing on the canvas
  const startDrawing = (e) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
      setIsDrawing(true);
    }
  };

  const draw = (e) => {
    if (isDrawing && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Add highlight annotation
  const addHighlight = () => {
    setAnnotations([
      ...annotations,
      { type: "highlight", position: { x: 50, y: 50 } },
    ]);
  };

  // Add text annotation
  const addText = () => {
    setAnnotations([
      ...annotations,
      { type: "text", text: text, position: { x: 100, y: 100 } },
    ]);
    setText(""); // Clear the text input field after adding
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save PDF functionality (this can be expanded for saving the modified PDF)
  const savePdf = () => {
    toast.success("Saving PDF...");
    // Implement the save logic (e.g., generate the modified PDF with annotations)
  };

  return (
    <div className="relative">
      {hasError ? (
        <p>Something went wrong while loading the PDF Viewer.</p>
      ) : (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <div
            style={{
              position: "relative",
              border: "1px solid rgba(0, 0, 0, 0.3)",
              height: "750px",
            }}
          >
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayout]}
              onDocumentLoadError={(err) => {
                console.error("PDF Viewer Error:", err);
                setHasError(true);
              }}
            />

            {/* Canvas for drawing over the PDF */}
            {/* <div className="absolute top-2 right-4 z-10 bg-white rounded-md border p-3">
              <canvas
                ref={canvasRef}
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: isDrawing ? "auto" : "none",
                  zIndex: 2, // Ensure canvas is on top of PDF content
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
              />
            </div> */}

            {/* Add text annotation */}
            {/* {annotations.map((annotation, index) => {
              if (annotation.type === "text") {
                return (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      top: annotation.position.y,
                      left: annotation.position.x,
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      padding: "5px",
                      zIndex: 3, // Make sure the text is above the canvas
                    }}
                  >
                    {annotation.text}
                  </div>
                );
              }
              return null;
            })} */}

            {/* Add image annotation */}
            {/* {image && (
              <img
                src={image}
                alt="Uploaded"
                style={{
                  position: "absolute",
                  top: 200,
                  left: 200,
                  width: "100px",
                  height: "100px",
                  zIndex: 3, // Ensure image is on top of canvas
                }}
              />
            )} */}

            {/* Annotation/Highlight and other buttons */}
            {/* <div
              style={{ position: "absolute", top: 10, right: 10, zIndex: 3 }}
            >
              <button onClick={addHighlight}>Highlight Text</button>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add text"
              />
              <button onClick={addText}>Add Text</button>

              <label>
                Upload Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              <button onClick={savePdf}>Save PDF</button>
            </div> */}
          </div>
        </Worker>
      )}
    </div>
  );
};

export default PdfViewer;
