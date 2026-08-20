export const buildTemplateComponents = ({
  bodyParams = [],      // ["Alex", "A12345", "shipped"]
  headerMedia,          // { type: "image"|"video"|"document", link, filename? }
  buttonParams,         // [{ subType: "url"|"quick_reply", index, text?, payload? }]
} = {}) => {
  const components = [];

  if (headerMedia) {
    components.push({
      type: "header",
      parameters: [{
        type: headerMedia.type,
        [headerMedia.type]: {
          link: headerMedia.link,
          ...(headerMedia.filename && headerMedia.type === "document" && { filename: headerMedia.filename }),
        },
      }],
    });
  }

  if (bodyParams.length) {
    components.push({
      type: "body",
      parameters: bodyParams.map((text) => ({ type: "text", text: String(text) })),
    });
  }

  buttonParams?.forEach(({ subType, index, text, payload }) => {
    const param = subType === "quick_reply" ? { type: "payload", payload } : { type: "text", text };
    components.push({ type: "button", sub_type: subType, index: String(index), parameters: [param] });
  });

  return components;
};