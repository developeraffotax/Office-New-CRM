import { useEffect, useRef } from "react";

export default function PDFViewer(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    let PSPDFKit;

    (async function () {
      PSPDFKit = await import("pspdfkit");

      if (PSPDFKit) {
        PSPDFKit.unload(container); // Ensure that there's only one PSPDFKit instance.
      }
      const instance = await PSPDFKit.load({
        container,
        document: props.document,
        baseUrl: `${window.location.protocol}//${window.location.host}/${
          import.meta.env.BASE_URL
        }`,
      });
    })();

    return () => {
      // Unload PSPDFKit instance when the component is unmounted
      PSPDFKit && PSPDFKit.unload(container);
    };
  }, [props.document]);

  return <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />;
}
