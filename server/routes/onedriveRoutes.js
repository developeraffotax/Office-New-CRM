import express from "express";
import axios from "axios";
//import { getAccessToken } from "./auth.js"; // function to get Graph API token

const router = express.Router();

router.get("/onedrive/folder/:clientName", async (req, res) => {
  const { clientName } = req.params;

  try {
    const token = await getAccessToken();

    // Query OneDrive "Clients" folder (replace with your parent folder path)
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/me/drive/root:/Clients:/children`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const folders = response.data.value;

    // Match folder by name
    const folder = folders.find(f => f.name.toLowerCase() === clientName.toLowerCase());

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    return res.json({ url: folder.webUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching OneDrive folder" });
  }
});

export default router;
