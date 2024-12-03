async function loadPDF({ PSPDFKit, container, document, baseUrl }) {
  const instance = await PSPDFKit.load({
    // Container where PSPDFKit should be mounted.
    container,
    // The document to open.
    document,
    baseUrl,
  });
  return instance;
}
export { loadPDF }; // Link this function with your project.
