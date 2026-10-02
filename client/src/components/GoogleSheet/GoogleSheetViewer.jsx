import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiFileText,
  FiShield,
} from "react-icons/fi";

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
  const [status, setStatus] = useState("loading");
  

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
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
            <FiFileText className="w-5 h-5 text-gray-500" />
          </div>

          <Spinner text="Loading sheet..." />
        </div>
      </div>
    );
  }

  if (status !== "ready") {
    const isForbidden = status === "forbidden";

    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="h-1 bg-gray-800" />

            <div className="p-7 text-center">
              <div className="mx-auto mb-5 w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                {isForbidden ? (
                  <FiShield className="w-5 h-5 text-gray-600" />
                ) : (
                  <FiAlertCircle className="w-5 h-5 text-gray-600" />
                )}
              </div>

              <h2 className="text-base font-semibold text-gray-900">
                {isForbidden
                  ? "Access restricted"
                  : "Unable to load sheet"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {MESSAGES[status]}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-gray-50">
      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0 gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <FiFileText className="w-[17px] h-[17px] text-gray-600" />
              </div>

              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-gray-900 truncate">
                  {sheet.name}
                </h1>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

                  <span className="text-[11px] text-gray-500">
                    Google Sheet
                  </span>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2 sm:p-3">
        <div className="relative w-full h-full overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gray-100 z-10 pointer-events-none" />

          <iframe
            key={sheet._id}
            src={sheet.embedUrl}
            title={sheet.name}
            className="w-full h-full border-0 block"
          />
        </div>
      </div>
    </div>
  );
}