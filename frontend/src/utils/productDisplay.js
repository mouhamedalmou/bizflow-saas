const isUrl = (value) => {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
};

const getNameFromUrl = (value) => {
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

export const getProductName = (product) => {
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

export const getProductDescription = (description) => {
  if (!description || isUrl(description)) {
    return "No description available.";
  }

  return description;
};
