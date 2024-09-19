import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillToolbar, { modules, formats } from "./QuillToolbar";

const CustomEditor = ({ template, setTemplate }) => {
  return (
    <div>
      <div className="form-group col-md-12 editor">
        <label className="font-weight-bold">
          {" "}
          Description <span className="required"> * </span>{" "}
        </label>
        <QuillToolbar toolbarId={"t1"} />

        <ReactQuill
          theme="snow"
          modules={modules("t1")}
          formats={formats}
          value={template}
          onChange={setTemplate}
          className="rounded-md relative min-h-[13rem]  h-[18rem] 2xl:h-[23rem]"
        />
      </div>
    </div>
  );
};

export default CustomEditor;
