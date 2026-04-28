import { useState } from "react";

const TmdbImage = ({
  src,
  alt,
  size = "w500",
  priority = false,
  className = "",
  objectFit = "object-cover",
  showBg = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const getOptimizedUrl = (url, targetSize) => {
    if (!url) return "";
    return url.replace("/original/", `/${targetSize}/`);
  };

  const optimizedSrc = getOptimizedUrl(src, size);

  return (
    <div
      className={`relative overflow-hidden ${showBg ? "bg-gray-800" : "bg-transparent"} ${className}`}
    >
      {showBg && !isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-700"></div>
      )}

      <img
        src={optimizedSrc}
        alt={alt}
        loading={priority ? undefined : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full ${objectFit} transition-opacity duration-500 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default TmdbImage;
