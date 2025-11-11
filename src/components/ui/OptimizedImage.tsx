import { ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  webpSrc?: string;
  alt: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * OptimizedImage component that uses WebP with PNG fallback
 * Automatically generates WebP path from PNG path if webpSrc not provided
 */
export default function OptimizedImage({
  src,
  webpSrc,
  alt,
  loading = "lazy",
  fetchPriority,
  className,
  ...props
}: OptimizedImageProps) {
  // Auto-generate WebP path if not provided
  const webpPath = webpSrc || src.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  const fallbackPath = src;

  return (
    <picture>
      <source srcSet={webpPath} type="image/webp" />
      <img
        src={fallbackPath}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        className={className}
        {...props}
      />
    </picture>
  );
}

