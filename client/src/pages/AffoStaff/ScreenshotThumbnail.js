import { useState } from "react";

export const ScreenshotThumbnail = ({ src, alt, onClick }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative h-36 bg-gray-200 rounded-lg overflow-hidden">
      {/* Image Skeleton / Placeholder */}
      {loading && (
        <div className="absolute inset-0 animate-pulse bg-gray-300"></div>
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-opacity duration-500 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        onClick={onClick}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};