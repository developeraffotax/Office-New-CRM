import axios from "axios";
import toast from "react-hot-toast";

// Validate video duration (max 20 minutes)
const validateVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration <= 1200) {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    video.onerror = () => {
      reject(new Error("Failed to load video"));
    };

    video.src = URL.createObjectURL(file);
  });
};

// Determine file type and set media type
export const fileType = (file, handleSendfiles, setLoading, setIsShow) => {
  setIsShow(false);
  if (file.type.startsWith("video/")) {
    UploadFiles(file, "Video", handleSendfiles, setLoading);
  } else if (file.type.startsWith("image/")) {
    UploadFiles(file, "Image", handleSendfiles, setLoading);
  } else if (file.type.startsWith("audio/")) {
    UploadFiles(file, "Audio", handleSendfiles, setLoading);
  } else if (file.type.startsWith("application/")) {
    UploadFiles(file, "File", handleSendfiles, setLoading);
  } else {
    toast.error("Invalid file type");
    return;
  }
};

// Upload file with validation (max size 20 MB)
export const UploadFiles = async (
  mediaUrl,
  mediaType,
  handleSendfiles,
  setLoading
) => {
  const maxFileSize = 20 * 1024 * 1024;

  if (!mediaUrl) {
    toast.error("No file selected");
    return;
  }

  if (mediaUrl.size > maxFileSize) {
    toast.error("File size must be less than 20 MB");
    return;
  }

  // Validate video duration if the file is a video
  if (mediaUrl.type.startsWith("video/")) {
    const isValidDuration = await validateVideoDuration(mediaUrl);
    if (!isValidDuration) {
      toast.error("Video duration must be less than 20 minutes");
      return;
    }
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", mediaUrl);

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/upload/file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    handleSendfiles(data.files[0], mediaType);
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload file");
  } finally {
    setLoading(false);
  }
};

// UpLoad Just Image
export const uploadImage = async (image, setAvatar, setLoad) => {
  try {
    setLoad(true);

    const formData = new FormData();
    formData.append("file", image);

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URI}/api/v1/auth/upload/file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setAvatar(data.url);
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload file");
  } finally {
    setLoad(false);
  }
};
