import React, { useRef } from "react";
import EmailEditor from "react-email-editor";
import Layout from "../../components/Loyout/Layout";

export default function Tickets() {
  const emailEditorRef = useRef(null);

  const exportHtml = () => {
    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;
      console.log("exportHtml", html);
    });
  };

  const onLoad = () => {
    // Load the design on editor load
    const designJson = {}; // You can load a saved design JSON here
    emailEditorRef.current.editor.loadDesign(designJson);
  };

  return (
    <Layout>
      <div className="w-full min-h-screen">
        <div className="w-full h-screen">
          <EmailEditor
            ref={emailEditorRef}
            onLoad={onLoad}
            className="w-full h-screen"
          />
        </div>
        {/* <button onClick={exportHtml}>Export HTML</button> */}
      </div>
    </Layout>
  );
}
