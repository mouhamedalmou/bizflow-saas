import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/axios";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { categoryName, type Product } from "../types";
import EditProductModal from "../components/EditProductModal";
import Loader from "../components/Loader";
import ProductImage from "../components/ProductImage";
import { getProductName } from "../utils/productDisplay";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { InlineAlert, PageHeader } from "../components/PageLayout";
import { SearchInput } from "../components/SearchInput";
import { StockBadge } from "../components/StockBadge";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  image: "",
};

const maxImageSize = 5 * 1024 * 1024;

interface ProductForm { name: string; description: string; price: string; stock: string; category: string; image: string }

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadInputKey, setUploadInputKey] = useState(0);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api
      .get<Product[]>("/products")
      .then(({ data }) => {
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Unable to load products"));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setUploadInputKey((currentKey) => currentKey + 1);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEdit = (product: Product): void => {
    setEditingProduct(product);
    setError("");
  };

  const uploadImageHandler = async (
    event: ChangeEvent<HTMLInputElement>,
    onImageUploaded: (url: string) => void,
    setUploadingState: Dispatch<SetStateAction<boolean>>
  ) => {
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

    setUploadingState(true);

    try {
      const { data } = await api.post("/upload/image", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onImageUploaded(data.imageUrl);

      toast.success("Image uploaded successfully.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Image upload failed."));
      event.target.value = "";
    } finally {
      setUploadingState(false);
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
      const { data } = await api.post<Product>("/products", payload);
      setProducts((current) => [data, ...current]);
      toast.success(`${getProductName(data)} created successfully.`);

      resetForm();
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to save product");

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleProductUpdated = (updatedProduct: Product): void => {
    setProducts((current) =>
      current.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setEditingProduct(null);
  };

  const handleDelete = async (productId: string): Promise<void> => {
    setDeleting(true);
    try {
      await api.delete(`/products/${productId}`);
      setProducts((current) =>
        current.filter((product) => product._id !== productId)
      );
      toast.success("Product deleted successfully.");

      if (editingProduct?._id === productId) {
        setEditingProduct(null);
      }
      setDeleteProduct(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to delete product"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader label="Loading admin products..." />;
  }

  const productsList = Array.isArray(products) ? products : [];
  const visibleProducts = productsList.filter((product) => `${getProductName(product)} ${product.category ? categoryName(product.category) : ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="space-y-8 font-sans lg:space-y-10">
      <PageHeader title="Admin Products" subtitle="Create, update and remove products from the catalog." actions={<SearchInput onChange={setQuery} placeholder="Search products..." />} />

      {error && (
        <InlineAlert>{error}</InlineAlert>
      )}

      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/20 lg:p-8"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-slate-100">
              Create product
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-indigo-400"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-indigo-400"
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-indigo-400"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-indigo-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="space-y-4">
              <ProductImage
                src={formData.image}
                alt={formData.name || "Product preview"}
                className="h-44"
              />

              <div>
                <label
                  htmlFor="imageFile"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Product image
                </label>
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                  <input
                    key={uploadInputKey}
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      uploadImageHandler(
                        event,
                        (imageUrl) =>
                          setFormData((current) => ({
                            ...current,
                            image: imageUrl,
                          })),
                        setUploading
                      )
                    }
                    disabled={uploading || saving}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500 disabled:cursor-not-allowed dark:text-slate-300"
                  />
                  <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {uploading
                        ? "Uploading image to S3..."
                        : "Choose a JPG, PNG or WebP image up to 5 MB."}
                    </span>
                    {formData.image && !uploading && (
                      <span className="font-medium text-emerald-700 dark:text-emerald-300">
                        Image ready for this product.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-6 min-h-11 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            {uploading
              ? "Uploading image..."
              : saving
              ? "Saving..."
              : "Create product"}
          </button>
        </form>

        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/20">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
            <h2 className="font-display text-xl font-bold text-slate-950 dark:text-slate-100">Product catalog</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed divide-y divide-slate-200 font-sans text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="w-24 px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="w-40 px-4 py-3 font-medium">Category</th>
                  <th className="w-24 px-4 py-3 font-medium">Price</th>
                  <th className="w-20 px-4 py-3 font-medium">Stock</th>
                  <th className="w-32 px-4 py-3 font-medium">Status</th>
                  <th className="w-36 px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleProducts.map((product) => (
                  <tr key={product._id} className="transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="px-4 py-3">
                      <ProductImage
                        src={product.image}
                        alt={getProductName(product)}
                        className="h-14 w-20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950 dark:text-slate-100">
                        {getProductName(product)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      <span className="line-clamp-2">
                        {product.category ? categoryName(product.category) : "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium tabular-nums text-slate-950 dark:text-slate-100">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium tabular-nums text-slate-700 dark:text-slate-300">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3"><StockBadge stock={product.stock} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteProduct(product)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleProducts.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={handleProductUpdated}
        />
      )}
      <ConfirmDialog isOpen={Boolean(deleteProduct)} title="Delete product" message={`Delete ${deleteProduct ? getProductName(deleteProduct) : "this product"}? This action cannot be undone.`} confirmLabel="Delete" cancelLabel="Cancel" isDangerous loading={deleting} onCancel={() => setDeleteProduct(null)} onConfirm={() => deleteProduct ? handleDelete(deleteProduct._id) : undefined} />
    </section>
  );
};

export default AdminProducts;
