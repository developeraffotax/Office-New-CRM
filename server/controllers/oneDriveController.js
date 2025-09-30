import axios from "axios";
import { getOneDriveAccessToken } from "../utils/getOneDriveAccessToken.js";

const PARENT_FOLDER = "Client Folder";
const EMAIL = process.env.MICROSOFT_AZURE_EMAIL || "Team@affotax.com";

export const getClientFolder = async (req, res) => {
  const { clientName } = req.params;

  // 🔹 Basic validation
  if (!clientName || typeof clientName !== "string" || !clientName.trim()) {
    return res.status(400).json({ message: "Client name is required" });
  }

  try {
    const token = await getOneDriveAccessToken();
    if (!token) {
      return res.status(500).json({ message: "Failed to get OneDrive access token" });
    }

    const url = `https://graph.microsoft.com/v1.0/users/${EMAIL}/drive/root:/${encodeURIComponent(
      PARENT_FOLDER
    )}/${encodeURIComponent(clientName)}:/`;

    const { data } = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 🔹 Ensure folder exists & is a folder
    if (!data || !data.folder) {
      return res.status(404).json({ message: "Folder not found or is not a folder" });
    }

    return res.json({ url: data.webUrl });



    
  } catch (error) {
    console.error("❌ OneDrive API Error:", error.response?.data || error.message);

    // Handle specific Graph API errors
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Folder not found" });
    }
    if (error.response?.status === 401) {
      return res.status(401).json({ message: "Unauthorized - check token or permissions" });
    }
    if (error.response?.status === 403) {
      return res.status(403).json({ message: "Forbidden - app may not have permission" });
    }

    return res.status(500).json({
      message:
        error?.response?.data?.error?.message ||
        "Unexpected error fetching OneDrive folder",
    });
  }
};
