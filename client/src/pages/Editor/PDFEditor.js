import React from "react";
import PDFViewer from "../../components/PDFViewer";

export default function PDFEditor() {
  return (
    <div className="App w-full h-full">
      <PDFViewer document={"/text1.pdf"} />
    </div>
  );
}
