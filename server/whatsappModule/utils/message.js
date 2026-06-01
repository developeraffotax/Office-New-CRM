 
export const parseMessage = (raw) => {
  const type = raw.type ?? "unknown";

  switch (type) {
    case "text":
      return { type: "text", body: raw.text?.body ?? "", media: null };

    case "image":
      return {
        type: "image",
        body: raw.image?.caption ?? "",
        media: { id: raw.image?.id, mimeType: raw.image?.mime_type, caption: raw.image?.caption ?? "" },
      };

    case "video":
      return {
        type: "video",
        body: raw.video?.caption ?? "",
        media: { id: raw.video?.id, mimeType: raw.video?.mime_type, caption: raw.video?.caption ?? "" },
      };

    case "audio":
      return {
        type: "audio",
        body: "",
        media: { id: raw.audio?.id, mimeType: raw.audio?.mime_type, voice: raw.audio?.voice ?? false },
      };

    case "document":
      return {
        type: "document",
        body: raw.document?.caption ?? "",
        media: {
          id:       raw.document?.id,
          mimeType: raw.document?.mime_type,
          filename: raw.document?.filename ?? "",
          caption:  raw.document?.caption ?? "",
        },
      };

    case "sticker":
      return {
        type: "sticker",
        body: "",
        media: { id: raw.sticker?.id, mimeType: raw.sticker?.mime_type, animated: raw.sticker?.animated ?? false },
      };

    case "location":
      return {
        type: "location",
        body: raw.location?.name ?? "",
        media: {
          latitude:  raw.location?.latitude,
          longitude: raw.location?.longitude,
          name:      raw.location?.name,
          address:   raw.location?.address,
          url:       raw.location?.url,
        },
      };

    case "interactive": {
      const replyType = raw.interactive?.type;                    // button_reply | list_reply
      const reply     = raw.interactive?.[replyType] ?? {};
      return {
        type: "text",
        body: reply.title ?? reply.description ?? JSON.stringify(raw.interactive),
        media: null,
      };
    }

    case "button":
      return { type: "text", body: raw.button?.text ?? "", media: null };

    case "order":
      return {
        type: "text",
        body: `🛒 Order (${raw.order?.product_items?.length ?? 0} items)`,
        media: null,
      };

    case "system":
      return { type: "text", body: raw.system?.body ?? "System message", media: null };

    default:
      return { type: "unknown", body: "", media: null };
  }
};

/**
 * Short preview string shown in the conversation list.
 */
export const buildPreview = (type, body, media) => ({
  text:     () => body?.slice(0, 200) ?? "",
  image:    () => media?.caption ? `📷 ${media.caption}` : "📷 Image",
  video:    () => media?.caption ? `🎥 ${media.caption}` : "🎥 Video",
  audio:    () => "🎵 Audio",
  document: () => media?.filename ? `📄 ${media.filename}` : "📄 Document",
  sticker:  () => "🎨 Sticker",
  location: () => "📍 Location",
  template: () => "📋 Template",
  unknown:  () => "Message",
}[type] ?? (() => "Message"))();
