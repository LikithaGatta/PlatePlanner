import React, { useState } from 'react';

// props for the image component
interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string; // backup image if main one fails
}

// component that shows a fallback image if the main one doesn't load
export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ 
  src, 
  fallback = '/placeholder.png', 
  alt = '',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src); // current image source
  const [hasError, setHasError] = useState(false); // track if image failed to load

  // switch to fallback image if main one fails
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  return <img src={imgSrc} alt={alt} onError={handleError} {...props} />;
};
