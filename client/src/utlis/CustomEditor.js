import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles

const CustomEditor = ({ template, setTemplate }) => {
  const quillRef = useRef(null); // Reference to ReactQuill

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler, // Custom image handler
      },
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  // Custom image handler
  function imageHandler() {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", reader.result);
      };
      reader.readAsDataURL(file);
    };
  }

  // Detect image selection
  const handleSelectionChange = (range, source, editor) => {
    if (range) {
      const [leaf] = editor.getLeaf(range.index);
      if (leaf && leaf.domNode.tagName === "IMG") {
        setSelectedImage(leaf.domNode);
        leaf.domNode.classList.add("selected-image"); // Highlight selected image
      } else if (selectedImage) {
        selectedImage.classList.remove("selected-image");
        setSelectedImage(null);
      }
    }
  };

  useEffect(() => {
    const quill = quillRef.current.getEditor();
    quill.on("selection-change", handleSelectionChange);
    return () => {
      quill.off("selection-change", handleSelectionChange);
    };
  }, [selectedImage]);

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={modules}
        formats={formats}
        value={template}
        onChange={setTemplate}
        className="rounded-md relative min-h-[13rem] max-[28rem] h-[13rem] 2xl:h-[23rem]"
      />
    </div>
  );
};

export default CustomEditor;
