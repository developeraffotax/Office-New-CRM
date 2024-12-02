import React, { useRef, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { RxScissors } from "react-icons/rx";
import ImageUploader from "../../components/Certificates/ImageUploader";
import TextInput from "../../components/Certificates/TextInput";
import SignaturePad from "../../components/Certificates/SignaturePad";
import { useAuth } from "../../context/authContext";
import CertificateCanvas from "../../components/Certificates/CertificateCanvas";
import PlaceholderPicker from "../../components/Certificates/PlaceholderPicker";
import FilesUploader from "../../components/Certificates/FilesUploader";
// import ImageMultiSelect from "../../components/Certificates/ImageMultiSelect";

export default function TemplateEditor() {
  const { auth } = useAuth();
  const [designMode, setDesignMode] = useState("image");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [texts, setTexts] = useState([]);
  const [htmlContent, setHtmlContent] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [placeholders, setPlaceholders] = useState([
    "%{{username}}",
    "%{{signature}}",
    "%{{date}}",
    "%{{course}}",
  ]);
  const htmlTextareaRef = useRef(null);

  // console.log("files:", files);

  // Handle Design Mode Change
  const handleDesignModeChange = (mode) => {
    setDesignMode(mode);
    // Reset relevant states when switching modes
    setImages([]);
    setTexts([]);
    setHtmlContent("");
  };

  //   handle Upload Image
  const handleImageUpload = (src) => {
    const newImage = {
      id: `image-${Date.now()}`,
      src,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    };
    setImages((prev) => [...prev, newImage]);
  };

  // Handle Upload Files
  const handleFilesUpload = (src) => {
    const newFile = {
      id: `pdf-${Date.now()}`,
      src,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    };
    setFiles((prev) => [...prev, newFile]);
  };

  //   Handle Select Multiple Image
  const handleSelectExistingImages = () => {
    selectedImages.forEach((image) => {
      // Prevent adding duplicate images
      if (!images.find((img) => img.src === image.value)) {
        const existingImage = {
          id: `image-${Date.now()}-${Math.random()}`,
          src: image.value,
          x: 50 + images.length * 10,
          y: 50 + images.length * 10,
          width: 100,
          height: 100,
        };
        setImages((prev) => [...prev, existingImage]);
      }
    });
  };

  // Handle Add Text
  const handleAddText = (text) => {
    const newText = {
      id: `text-${Date.now()}`,
      text,
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
    };
    setTexts((prev) => [...prev, newText]);
  };

  // Handle Signatures
  const handleSignatureSave = (dataUrl) => {
    handleImageUpload(dataUrl);
  };

  // Handle inserting placeholder into HTML content

  const handleInsertPlaceholder = (placeholder) => {
    if (htmlTextareaRef.current) {
      const textarea = htmlTextareaRef.current;
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const before = htmlContent.substring(0, startPos);
      const after = htmlContent.substring(endPos, htmlContent.length);
      const newContent = before + placeholder + after;
      setHtmlContent(newContent);
      // Move the cursor position after the inserted placeholder
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          startPos + placeholder.length;
        textarea.focus();
      }, 0);
    }
  };
  return (
    <Layout>
      <div className=" relative w-full h-full flex flex-col bg-gray-100 gap-4 overflow-y-auto py-4 px-2 sm:px-4">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-xl sm:text-3xl font-semibold w-full flex items-center gap-1 tracking-wide text-gray-800 relative before:absolute before:left-0 before:-bottom-1.5 before:h-[3px] before:w-10 before:bg-orange-500 before:transition-all before:duration-300 hover:before:w-16">
            Template{" "}
            <span className="text-orange-600 flex items-center gap-2">
              Editor <RxScissors />
            </span>
          </h1>
        </div>
        {/* -------------Body---------------- */}
        <div className="w-[100%] h-full flex items-start justify-center  ">
          <div className="w-full sm:w-[99%] h-full rounded-md  bg-[#fff] grid grid-cols-6 overflow-hidden ">
            {/* -----------Design Editor--------------- */}
            <div className="w-full h-full flex overflow-y-auto overflow-hidden col-span-2 ">
              <div className="w-full h-full flex-col gap-4 overflow-y-auto overflow-x-hidden py-3 px-3 ">
                {/* -------Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-950 mb-2">
                    Choose Design Mode:
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="designMode"
                        value="image"
                        checked={designMode === "image"}
                        onChange={() => handleDesignModeChange("image")}
                        className="form-radio h-4 w-4 text-orange-600"
                      />
                      <span className=" text-[12px] font-medium text-gray-700">
                        Design from Image
                      </span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="designMode"
                        value="pdf"
                        checked={designMode === "pdf"}
                        onChange={() => handleDesignModeChange("pdf")}
                        className="form-radio h-4 w-4 text-orange-600"
                      />
                      <span className=" text-[12px] font-medium text-gray-700">
                        Design from PDF
                      </span>
                    </label>
                    {/* <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="designMode"
                        value="html"
                        checked={designMode === "html"}
                        onChange={() => handleDesignModeChange("html")}
                        className="form-radio h-4 w-4 text-orange-600"
                      />
                      <span className=" text-[12px] font-medium text-gray-700">
                        From HTML
                      </span>
                    </label> */}
                  </div>
                </div>
                {/* ------Editor--- */}
                <div className="w-full flex flex-col gap-4">
                  <div className=" flex flex-col gap-2 w-full">
                    {designMode === "image" ? (
                      <>
                        {/* Image Design Controls */}
                        <ImageUploader onImageUpload={handleImageUpload} />
                        {/* <ImageMultiSelect
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                      /> */}
                        {/* <button
                          onClick={handleSelectExistingImages}
                          className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-300"
                        >
                          Add Selected Images
                        </button> */}
                        <TextInput onAddText={handleAddText} />
                        <SignaturePad onSave={handleSignatureSave} />
                        {/* Additional controls can be added here */}
                      </>
                    ) : designMode === "pdf" ? (
                      <>
                        {/* Image Design Controls */}
                        <FilesUploader onImageUpload={handleFilesUpload} />
                        {/* <ImageMultiSelect
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                      /> */}
                        <button
                          onClick={handleSelectExistingImages}
                          className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-300"
                        >
                          Add Selected PDF
                        </button>
                        <TextInput onAddText={handleAddText} />
                        <SignaturePad onSave={handleSignatureSave} />
                        {/* Additional controls can be added here */}
                      </>
                    ) : (
                      <>
                        {/* HTML Design Controls */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Paste HTML Code:
                          </label>
                          <textarea
                            ref={htmlTextareaRef}
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            rows={10}
                            className="mt-1 block w-full p-2 border-2 outline-none border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            placeholder="<html><body><h1>Certificate</h1><p>%{{username}}</p><p>%{{signature}}</p></body></html>"
                          />
                        </div>
                        {/* Placeholder Picker */}
                        <div className="space-y-4">
                          <PlaceholderPicker
                            placeholders={placeholders}
                            onInsertPlaceholder={handleInsertPlaceholder}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/*---------------- Template ------------- */}
            <div className="w-full h-full col-span-4  ">
              <CertificateCanvas
                images={images}
                texts={texts}
                setImages={setImages}
                setTexts={setTexts}
                designMode={designMode}
                htmlContent={htmlContent}
                setHtmlContent={setHtmlContent}
                placeholders={placeholders}
                files={files}
                setFiles={setFiles}
              />
            </div>
          </div>
        </div>

        {/*  */}
      </div>
    </Layout>
  );
}
