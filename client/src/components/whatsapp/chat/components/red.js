const renderReplyPreview = (reply) => {
  if (!reply) return null;

  let previewText = "";

  switch (reply.type) {
    case "image":
      previewText = "📷 Photo";
      break;
    case "video":
      previewText = "🎥 Video";
      break;
    case "audio":
      previewText = "🎵 Audio";
      break;
    case "document":
      previewText = `📄 ${reply.media?.filename || "Document"}`;
      break;
    case "location":
      previewText = "📍 Location";
      break;
    case "sticker":
      previewText = "😀 Sticker";
      break;
    default:
      previewText = reply.body;
  }

  return (
    <div className="mb-2 border-l-4 border-green-500 bg-black/5 rounded-r-md px-3 py-2">
      <div className="text-[11px] font-semibold text-green-600">
        {reply.direction === "outbound" || reply.userId
          ? "You"
          : "Customer"}
      </div>

      <div className="text-xs text-gray-600 truncate">
        {previewText}
      </div>
    </div>
  );
};