import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/axios";
import type { ChangeEvent, FormEvent } from "react";
import { categoryId, type Product } from "../types";
import ProductImage from "./ProductImage";
import { getProductName } from "../utils/productDisplay";

const maxImageSize = 5 * 1024 * 1024;

interface ProductForm { name: string; description: string; price: string; stock: string; category: string; image: string }
interface EditProductModalProps { product: Product; onClose: () => void; onUpdated: (product: Product) => void }

const buildInitialForm = (product: Product): ProductForm => ({
  name: product.name || "",
  description: product.description || "",
  price: String(product.price ?? ""),
  stock: String(product.stock ?? ""),
  category: product.category ? categoryId(product.category) : "",
  image: product.image || "",
});

const EditProductModal = ({ product, onClose, onUpdated }: EditProductModalProps) => {
  const [formData, setFormData] = useState(() => buildInitialForm(product));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadInputKey, setUploadInputKey] = useState(0);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const uploadImageHandler = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > maxImageSize) {
      toast.error("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const uploadData = new FormData();
    uploadData.append("image", file);

    setUploading(true);

    try {
      const { data } = await api.post("/upload/image", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!data.imageUrl) {
        throw new Error("Upload did not return an image URL.");
      }

      setFormData((current) => ({
        ...current,
        image: data.imageUrl,
      }));
      setUploadInputKey((currentKey) => currentKey + 1);
      toast.success("Image uploaded successfully.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Image upload failed."));
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (uploading) {
      toast.error("Please wait until the image upload finishes.");
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    };

    try {
      const { data } = await api.put<Product>(`/products/${product._id}`, payload);
      toast.success(`${getProductName(data)} updated successfully.`);
      onUpdated(data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to update product");

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close edit product modal"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editProductTitle"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-200 bg-white font-sans shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h2
              id="editProductTitle"
              className="font-display text-xl font-bold tracking-tight text-slate-950 dark:text-white"
            >
              Edit product
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update product details and optionally replace the image.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="editName"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Name
                </label>
                <input
                  id="editName"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
                />
              </div>

              <div>
                <label
                  htmlFor="editCategory"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Category
                </label>
                <input
                  id="editCategory"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="editPrice"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Price
                  </label>
                  <input
                    id="editPrice"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="editStock"
                    className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Stock
                  </label>
                  <input
                    id="editStock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="editDescription"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Description
                </label>
                <textarea
                  id="editDescription"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950"
                />
              </div>
            </div>

            <div className="space-y-4">
              <ProductImage
                src={formData.image}
                alt={formData.name || "Product preview"}
                className="h-56"
              />

              <div>
                <label
                  htmlFor="editImageFile"
                  className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Replace image optional
                </label>
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <input
                    key={uploadInputKey}
                    id="editImageFile"
                    type="file"
                    accept="image/*"
                    onChange={uploadImageHandler}
                    disabled={uploading || saving}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 disabled:cursor-not-allowed dark:text-slate-300"
                  />
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    {uploading
                      ? "Uploading new image to S3..."
                      : "Leave unchanged or upload a new image."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {uploading
                ? "Uploading image..."
                : saving
                  ? "Saving changes..."
                  : "Save update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
