import type { Product } from "../types";

const isUrl = (value: unknown): value is string => {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
};

const getNameFromUrl = (value: string | undefined): string => {
  if (!value) return "";
  try {
    const url = new URL(value);
    const fileName = url.pathname.split("/").filter(Boolean).pop() || "";
    const withoutExtension = fileName.replace(/\.[a-z0-9]+$/i, "");
    const readableName = decodeURIComponent(withoutExtension)
      .replace(/[-_]+/g, " ")
      .trim();

    return readableName || "";
  } catch {
    return "";
  }
};

export const getProductName = (product: Partial<Product>): string => {
  if (!isUrl(product?.name) && product?.name) {
    return product.name;
  }

  return (
    getNameFromUrl(product?.image) ||
    getNameFromUrl(product?.name) ||
    product?.category ||
    "Product"
  );
};

export const getProductDescription = (description?: string): string => {
  if (!description || isUrl(description)) {
    return "No description available.";
  }

  return description;
};
