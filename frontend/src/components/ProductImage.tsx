import { useState } from "react";

interface ProductImageProps { src?: string; alt: string; className?: string }

const ProductImage = ({ src, alt, className = "" }: ProductImageProps) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const shouldShowImage = src && !hasError;

  return (
    <div
      className={[
        "flex overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
        className,
      ].join(" ")}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-medium text-slate-400">
          No image
        </div>
      )}
    </div>
  );
};

export default ProductImage;
