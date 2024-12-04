import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import DraggableImage from "./DraggableImage";
import DraggableText from "./DraggableText";
import TextAdjustments from "./TextAdjustments";
import DOMPurify from "dompurify";
import HtmlCertificate from "./HtmlCertificate";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";
import { ImUndo2 } from "react-icons/im";
import { ImRedo2 } from "react-icons/im";
import jsPDF from "jspdf";
import DraggableFiles from "./DraggableFiles";
import PdfViewer from "./PdfViewer";

const CertificateCanvas = ({
  images,
  files,
  texts,
  setImages,
  setTexts,
  designMode,
  htmlContent,
  setHtmlContent,
  placeholders,
  setFiles,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const stageRef = useRef(null);
  const htmlCertificateRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(750);
  const [containerHeight, setContainerHeight] = useState(520);

  console.log("files:", files);

  useEffect(() => {
    const updateDimensions = () => {
      if (window.innerWidth < 1500) {
        setContainerWidth(750);
        setContainerHeight(520);
      } else if (window.innerWidth > 1500 && window.innerWidth < 1800) {
        setContainerWidth(950);
        setContainerHeight(600);
      } else {
        setContainerWidth(1200);
        setContainerHeight(720);
      }
    };

    // Add event listener
    window.addEventListener("resize", updateDimensions);

    // Call initially to set dimensions
    updateDimensions();

    // Cleanup event listener
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Undo/Redo stacks
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // Canvas dimensions
  // const containerWidth = 750;
  // const containerHeight = 520;

  // Preview data state
  const [previewData, setPreviewData] = useState(null);

  // Handle selection
  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleDeselect = () => {
    setSelectedId(null);
  };

  // Wrapper functions for undo/redo
  const updateImages = (newImages) => {
    setHistory((prev) => [...prev, { images, texts }]);
    setImages(newImages);
    setFuture([]);
  };

  const updateTexts = (newTexts) => {
    setHistory((prev) => [...prev, { images, texts }]);
    setTexts(newTexts);
    setFuture([]);
  };

  // Function to update a single text element
  const handleUpdateText = (updatedText) => {
    const newTexts = texts.map((txt) =>
      txt.id === updatedText.id ? updatedText : txt
    );
    updateTexts(newTexts);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setFuture((prev) => [{ images, texts }, ...prev]);
      setImages(previousState.images);
      setTexts(previousState.texts);
      setHistory((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      setHistory((prev) => [...prev, { images, texts }]);
      setImages(nextState.images);
      setTexts(nextState.texts);
      setFuture((prev) => prev.slice(1));
    }
  };

  const handleDelete = () => {
    if (selectedId) {
      const isImage = images.some((img) => img.id === selectedId);
      if (isImage) {
        const newImages = images.filter((img) => img.id !== selectedId);
        updateImages(newImages);
      } else {
        const newTexts = texts.filter((txt) => txt.id !== selectedId);
        updateTexts(newTexts);
      }
      setSelectedId(null);
    }
  };

  // Modified handleExport to capture HTML as image
  const handleExport = async () => {
    if (designMode === "image") {
      if (stageRef.current) {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = "certificate.png";
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (designMode === "html") {
      if (htmlCertificateRef.current) {
        try {
          const dataUrl = await toPng(htmlCertificateRef.current, {
            cacheBust: true,
            backgroundColor: "#ffffff", // Ensure background is white
          });

          const link = document.createElement("a");
          link.download = "certificate.png";
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error("Failed to export certificate:", error);
          toast.error("error", "Failed to export certificate as image.");
        }
      } else {
        toast.error("error", "Certificate content is not available.");
      }
    } else if (designMode === "pdf") {
      // Export to PDF
      const doc = new jsPDF();

      if (htmlCertificateRef.current) {
        // Convert HTML content to PDF
        const htmlContent = htmlCertificateRef.current.innerHTML;
        doc.html(htmlContent, {
          callback: function (doc) {
            doc.save("certificate.pdf");
          },
          margin: [10, 10, 10, 10],
        });
      } else if (stageRef.current) {
        // Export canvas content as PDF
        const canvasDataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
        doc.addImage(canvasDataUrl, "PNG", 10, 10);
        doc.save("certificate.pdf");
      } else {
        toast.error("No content to export to PDF.");
      }
    }
  };

  const handleSaveMine = async () => {
    if (uploading) return;
    setUploading(true);

    // Dynamically import Swal
    const Swal = (await import("sweetalert2")).default;

    // Show loading alert
    Swal.fire({
      title: "Saving...",
      text: "Please wait while your certificate is being saved.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let response;

      if (designMode === "image") {
        if (!stageRef.current) {
          throw new Error("Stage reference is not available.");
        }

        if (images.length === 0 && texts.length === 0) {
          throw new Error(
            "Canvas is empty. Please add images or text before saving."
          );
        }

        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
        const fileName = `certificate-${Date.now()}.png`;

        if (!dataUrl.startsWith("data:image/")) {
          throw new Error("Invalid image data.");
        }

        const payload = {
          dataUrl,
          description: "My Certificate",
          fileName,
        };

        response = await fetch("/api/certificates/save-mine", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.close();
          toast.success(
            "success",
            data.message || "Certificate saved successfully."
          );
          const savedData = { dataUrl: data.secure_url, fileName };
          setPreviewData(savedData);
        } else {
          Swal.close();
          toast.error("error", data.message || "Failed to save certificate.");
          return;
        }
      } else if (designMode === "html") {
        if (!htmlContent) {
          throw new Error("HTML content is empty.");
        }

        const fileName = `certificate-${Date.now()}.html`;

        const payload = {
          htmlContent,
          description: "My HTML Certificate",
          fileName,
        };

        response = await fetch("/api/certificates/save-mine-html", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.close();
          toast.success(
            "success",
            data.message || "HTML Certificate saved successfully."
          );
          const savedData = { htmlContent: data.htmlContent, fileName };
          setPreviewData(savedData);
        } else {
          Swal.close();
          toast.error(
            "error",
            data.message || "Failed to save HTML certificate."
          );
          return;
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Swal.close();
      toast.error("error", error.message || "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  // Show preview when previewData is updated
  useEffect(() => {
    const showPreview = async () => {
      if (previewData) {
        const Swal = (await import("sweetalert2")).default;

        if (previewData.dataUrl) {
          Swal.fire({
            title: "Certificate Preview",
            imageUrl: previewData.dataUrl,
            imageAlt: "Certificate Image",
            showCloseButton: true,
            showConfirmButton: false,
            width: "80%",
            heightAuto: true,
          });
        } else if (previewData.htmlContent) {
          Swal.fire({
            title: "Certificate Preview",
            html: previewData.htmlContent,
            showCloseButton: true,
            showConfirmButton: false,
            width: "80%",
            heightAuto: true,
          });
        }
      }
    };

    showPreview();
  }, [previewData]);

  // Function to replace placeholders with sample data for preview
  const getPreviewHtml = () => {
    let previewHtml = htmlContent;
    const sampleData = {
      username: "John Doe",
      signature:
        '<img src="https://example.com/signature.png" alt="Signature" style="width:100px;height:auto;" />',
      date: new Date().toLocaleDateString(),
      course: "Introduction to Programming",
      // Add more sample data as needed
    };

    // Replace placeholders with sample data
    placeholders.forEach((placeholder) => {
      const key = placeholder.replace("%{{", "").replace("}}", "");
      const value = sampleData[key] || "";
      const regex = new RegExp(placeholder, "g");
      previewHtml = previewHtml.replace(regex, value);
    });

    // Sanitize the HTML before rendering
    const sanitizedHtml = DOMPurify.sanitize(previewHtml);

    return sanitizedHtml;
  };

  const base64Signature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

  const sampleData = {
    username: "John Doe",
    signature: `<img src="${base64Signature}" alt="Signature" style="width:200px;" />`,
    date: new Date().toLocaleDateString(),
    course: "Introduction to Programming",
  };

  return (
    <div className="w-full h-full p-2">
      <div className="w-full  flex items-center gap-3 pb-2">
        {designMode === "image" && (
          <>
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={` text-[14px] p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none ${
                history.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Undo"
            >
              <ImUndo2 className="text-[22]" />
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className={`text-[14px] p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none ${
                future.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title="Redo"
            >
              <ImRedo2 className="text-[22]" />
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedId}
              className={`text-[14px] px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none ${
                !selectedId ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Delete Selected
            </button>
            <button
              onClick={handleExport}
              className="text-[14px] px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              Export as {designMode === "pdf" ? "PDF" : "Image"}
            </button>
            <button
              onClick={handleSaveMine}
              disabled={uploading}
              className={`text-[14px] px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Saving..." : "Save Mine"}
            </button>
          </>
        )}
      </div>
      <div className="flex">
        {designMode === "image" ? (
          <div className="relative">
            <Stage
              width={containerWidth}
              height={containerHeight}
              ref={stageRef}
              className="bg-white border rounded-md overflow-hidden"
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) {
                  handleDeselect();
                }
              }}
            >
              <Layer>
                {images.map((image) => (
                  <DraggableImage
                    key={image.id}
                    image={image}
                    isSelected={image.id === selectedId}
                    onSelect={handleSelect}
                    setImages={updateImages}
                    images={images}
                    containerWidth={containerWidth}
                    containerHeight={containerHeight}
                  />
                ))}
                {texts.map((text) => (
                  <DraggableText
                    key={text.id}
                    text={text}
                    isSelected={text.id === selectedId}
                    onSelect={handleSelect}
                    setTexts={updateTexts}
                    texts={texts}
                  />
                ))}
              </Layer>
            </Stage>
            {/* Text Adjustments */}
            {selectedId && texts.some((txt) => txt.id === selectedId) && (
              <TextAdjustments
                selectedText={
                  texts.find((txt) => txt.id === selectedId) || null
                }
                onUpdateText={handleUpdateText}
              />
            )}
          </div>
        ) : designMode === "pdf" ? (
          <div className="relative w-full h-full min-h-[85vh] rounded-sm border">
            {files.length > 0 ? (
              <PdfViewer file={files[0].src || ""} />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[80vh] p-4">
                <div className="flex flex-col gap-0">
                  <img
                    src="/rb_4702.png"
                    alt="Notfound"
                    className="h-[13rem] w-[13rem]"
                  />
                  <p className="text-[13px] font-normal text-center w-full text-gray-600">
                    No PDF file selected!
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full bg-white rounded-md shadow-md p-4 overflow-auto border"
            ref={htmlCertificateRef} // Attach ref here
          >
            <HtmlCertificate
              username={sampleData.username}
              course={sampleData.course}
              date={sampleData.date}
              signature={sampleData.signature}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCanvas;
