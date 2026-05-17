import React, { useState } from 'react';

// The fallback SVG string you provided
export const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4=";

export const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);

  const handleError = () => {
    // If the main image fails, switch to the SVG fallback
    if (imgSrc !== ERROR_IMG_SRC) {
      setImgSrc(ERROR_IMG_SRC);
    }
  };

  return (
    <img
      {...props}
      src={imgSrc || ERROR_IMG_SRC}
      alt={alt || "BookHaven Image"}
      className={className}
      onError={handleError}
    />
  );
};