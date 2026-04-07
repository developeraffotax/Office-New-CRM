import cloudinary from "../../config/cloudinary.js";

 

export const uploadBase64Images = async (html) => {
  try {
    if (!html) return html;

    // Match base64 images
    const base64Regex =
      /<img[^>]+src="(data:image\/[^";]+;base64,[^"]+)"[^>]*>/g;

    let updatedHtml = html;

    const matches = [...html.matchAll(base64Regex)];

    for (const match of matches) {
      const base64Data = match[1];

      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(
        base64Data,
        {
          folder: "complaints",
        }
      );

      // Replace base64 with cloudinary URL
      updatedHtml = updatedHtml.replace(
        base64Data,
        result.secure_url
      );
    }

    return updatedHtml;
  } catch (error) {
    console.log("Cloudinary Upload Error:", error);
    throw error;
  }
};