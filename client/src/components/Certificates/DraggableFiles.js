import React, { useRef, useEffect, useState } from "react";
import {
  Image as KonvaImage,
  Transformer as KonvaTransformer,
} from "react-konva";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Set the worker source for PDF.js
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js`;

const DraggableFiles = ({ files, isSelected, onSelect, setFiles }) => {
  const shapeRef = useRef(null);
  const trRef = useRef(null);
  const [pdfImage, setPdfImage] = useState(null); // To store the rendered PDF page as image
  const [pdfLoaded, setPdfLoaded] = useState(false); // To track if the PDF is loaded

  // Function to render the PDF page into an image
  const renderPdfPage = async (file) => {
    try {
      const pdf = await getDocument(file.src).promise;
      const page = await pdf.getPage(1); // Render the first page of the PDF

      const scale = 1.5; // Adjust the scale as needed
      const viewport = page.getViewport({ scale });

      // Create a canvas to render the PDF page
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the page onto the canvas
      await page.render({ canvasContext: context, viewport }).promise;

      // Convert canvas to an image data URL
      const imageUrl = canvas.toDataURL();

      console.log("imageUrl:", imageUrl);

      // Set the image URL as the state to display in Konva
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setPdfImage(img);
        setPdfLoaded(true);
      };
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  };

  useEffect(() => {
    if (files && files[0].type === "pdf") {
      renderPdfPage(files[0]); // Render PDF when the file is loaded
    }
  }, [files]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Attach the transformer to the selected file
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    const newFiles = files.map((file) =>
      file.id === files[0].id
        ? {
            ...file,
            x: e.target.x(),
            y: e.target.y(),
          }
        : file
    );
    setFiles(newFiles);
  };

  const handleTransformEnd = () => {
    if (shapeRef.current) {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Update the file dimensions based on scale
      const newWidth = node.width() * scaleX;
      const newHeight = node.height() * scaleY;

      const minWidth = 50;
      const minHeight = 50;

      const finalWidth = Math.max(newWidth, minWidth);
      const finalHeight = Math.max(newHeight, minHeight);

      const newFiles = files.map((file) =>
        file.id === files[0].id
          ? {
              ...file,
              x: node.x(),
              y: node.y(),
              width: finalWidth,
              height: finalHeight,
            }
          : file
      );

      setFiles(newFiles);
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  return (
    <>
      {files.map((file) => (
        <React.Fragment key={file.id}>
          {file.type === "pdf" && pdfLoaded && pdfImage && (
            <KonvaImage
              image={pdfImage} // Use the loaded image object
              x={file.x}
              y={file.y}
              width={file.width}
              height={file.height}
              draggable
              onClick={() => onSelect(file.id)}
              onTap={() => onSelect(file.id)}
              ref={shapeRef}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
            />
          )}

          {isSelected && (
            <KonvaTransformer
              ref={trRef}
              boundBoxFunc={(oldBox, newBox) => {
                const minWidth = 50;
                const minHeight = 50;

                if (newBox.width < minWidth || newBox.height < minHeight) {
                  return oldBox;
                }
                return newBox;
              }}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "top-center",
                "bottom-center",
                "middle-left",
                "middle-right",
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default DraggableFiles;
