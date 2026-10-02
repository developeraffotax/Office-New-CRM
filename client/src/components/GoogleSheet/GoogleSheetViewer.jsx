import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getSheetApi } from "../../services/googlesheetService";
import Spinner from "../../utlis/Spinner";

const MESSAGES = {
  forbidden: "You don't have access to this sheet.",
  notfound: "This sheet doesn't exist or was removed.",
  error: "Something went wrong while loading this sheet.",
};

export default function GoogleSheetViewer() {
  const { sheetId } = useParams();
  const [sheet, setSheet] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | forbidden | notfound | error

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setSheet(null);

    getSheetApi(sheetId)
      .then(({ data }) => {
        if (cancelled) return;
        setSheet(data.sheet);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        const code = err?.response?.status;
        setStatus(
          code === 403
            ? "forbidden"
            : code === 404 || code === 400
            ? "notfound"
            : "error",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [sheetId]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center  ">
        <Spinner text="Loading sheet..." />
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        {MESSAGES[status]}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      <iframe
        key={sheet._id}
        src={sheet.embedUrl}
        title={sheet.name}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}
