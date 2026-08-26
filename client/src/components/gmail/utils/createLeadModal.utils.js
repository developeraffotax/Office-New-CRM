export const formatLeadOption = (lead) => {
  const { raw } = lead;

  return (
    <div className="flex items-center gap-3 py-1">
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
        {(raw.clientName || raw.companyName || "?")
          .charAt(0)
          .toUpperCase()}
      </div>

      {/* Main information */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 truncate">
            {raw.clientName || raw.companyName || "Unnamed Lead"}
          </span>

          {raw.leadRef && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500">
              L-{raw.leadRef}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          {raw.companyName && raw.clientName && (
            <>
              <span className="truncate">{raw.companyName}</span>
              <span className="text-gray-300">•</span>
            </>
          )}

          <span className="truncate">
            {raw.email || "No email"}
          </span>
        </div>
      </div>

      {/* Stage */}
      {raw.stage && (
        <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-600">
          {raw.stage}
        </span>
      )}
    </div>
  );
};