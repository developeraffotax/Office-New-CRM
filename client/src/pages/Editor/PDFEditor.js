import React, { useState, useRef } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import html2canvas from "html2canvas";
import { PDFDocument, rgb } from "pdf-lib";

// Use a stable version of the worker script
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js"; // This URL is for a stable version

const PdfEditor = () => {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [editedPdf, setEditedPdf] = useState(null);
  const [signature, setSignature] = useState(null); // For storing signature
  const [image, setImage] = useState(null); // For storing logo/image
  const canvasRef = useRef(null);

  console.log("pdfUrl", pdfUrl);

  // Handle file change
  const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setFile(file);
      setPdfUrl(fileUrl);
    }
  };

  // Add signature to PDF
  const addSignatureToPdf = async () => {
    if (!file) return alert("Please upload a PDF file first.");

    // Load the PDF
    const existingPdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Add a signature (for simplicity, adding a text signature)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawText("Signature: John Doe", {
      x: 50,
      y: 50,
      size: 30,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const editedBlob = new Blob([pdfBytes], { type: "application/pdf" });
    setEditedPdf(URL.createObjectURL(editedBlob));
  };

  // Add image/logo to PDF
  const addImageToPdf = async () => {
    if (!file || !image) return alert("Please upload a PDF file and an image.");

    // Load the PDF
    const existingPdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Add an image to the PDF
    const imageBytes = await fetch(image).then((res) => res.arrayBuffer());
    const pdfImage = await pdfDoc.embedPng(imageBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    firstPage.drawImage(pdfImage, {
      x: 200,
      y: 200,
      width: 100,
      height: 100,
    });

    const pdfBytes = await pdfDoc.save();
    const editedBlob = new Blob([pdfBytes], { type: "application/pdf" });
    setEditedPdf(URL.createObjectURL(editedBlob));
  };

  // Download the edited PDF
  const downloadEditedPdf = () => {
    if (!editedPdf) return alert("No edits made to download.");
    const link = document.createElement("a");
    link.href = editedPdf;
    link.download = "edited.pdf";
    link.click();
  };

  // Capture signature from the canvas
  const captureSignatureCanvas = () => {
    if (canvasRef.current) {
      html2canvas(canvasRef.current).then((canvas) => {
        const dataURL = canvas.toDataURL();
        setSignature(dataURL);
      });
    }
  };

  return (
    <div>
      <h1>PDF Editor</h1>

      {/* File upload */}
      <input type="file" accept="application/pdf" onChange={onFileChange} />

      {/* Display PDF */}
      {pdfUrl && (
        <Document file={pdfUrl}>
          <Page pageNumber={1} />
        </Document>
      )}

      {/* Signature input */}
      <div>
        <h3>Sign Below</h3>
        <div
          ref={canvasRef}
          style={{
            border: "1px solid #000",
            width: "400px",
            height: "200px",
            marginBottom: "10px",
          }}
        />
        <button onClick={captureSignatureCanvas}>Capture Signature</button>
      </div>

      {/* Signature display */}
      {signature && (
        <div>
          <h3>Captured Signature</h3>
          <img
            src={signature}
            alt="Signature"
            style={{ width: "100px", height: "50px" }}
          />
        </div>
      )}

      {/* Image/Logo input */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
      />
      <button onClick={addImageToPdf}>Add Image/Logo</button>

      {/* Add Signature button */}
      <button onClick={addSignatureToPdf}>Add Signature to PDF</button>

      {/* Download button */}
      <button onClick={downloadEditedPdf}>Download Edited PDF</button>
    </div>
  );
};

export default PdfEditor;
