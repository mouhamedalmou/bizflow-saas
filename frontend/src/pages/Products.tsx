import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/axios";
import type { Product, ShippingAddress } from "../types";
import Loader from "../components/Loader";
import ProductImage from "../components/ProductImage";
import { Modal } from "../components/Modal";
import {
  getProductDescription,
  getProductName,
} from "../utils/productDisplay";
import { categoryName } from "../types";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const emptyShippingAddress: ShippingAddress = { street: "", city: "", zip: "", country: "" };

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(emptyShippingAddress);
  const [addressError, setAddressError] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      setError("");
      setLoading(true);

      try {
        const { data } = await api.get<Product[]>("/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load products"));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openOrderDialog = (product: Product): void => {
    if (product.stock < 1) {
      toast.error("This product is out of stock.");
      return;
    }
    setSelectedProduct(product);
    setShippingAddress(emptyShippingAddress);
    setAddressError("");
  };

  const closeOrderDialog = (): void => {
    if (orderingId) return;
    setSelectedProduct(null);
    setAddressError("");
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const field = event.target.name as keyof ShippingAddress;
    setShippingAddress((current) => ({ ...current, [field]: event.target.value }));
    setAddressError("");
  };

  const handleOrderNow = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const product = selectedProduct;
    if (!product) return;

    const normalizedAddress: ShippingAddress = {
      street: shippingAddress.street.trim(),
      city: shippingAddress.city.trim(),
      zip: shippingAddress.zip.trim(),
      country: shippingAddress.country.trim(),
    };
    if (Object.values(normalizedAddress).some((value) => !value)) {
      setAddressError("Complete all shipping address fields.");
      return;
    }

    setOrderingId(product._id);

    try {
      await api.post("/orders", {
        orderItems: [
          {
            product: product._id,
            quantity: 1,
          },
        ],
        shippingAddress: normalizedAddress,
      });

      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) =>
          currentProduct._id === product._id
            ? {
                ...currentProduct,
                stock: Math.max(currentProduct.stock - 1, 0),
              }
            : currentProduct
        )
      );
      toast.success(`${getProductName(product)} ordered successfully.`);
      setSelectedProduct(null);
      setShippingAddress(emptyShippingAddress);
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to create order");

      toast.error(message);
    } finally {
      setOrderingId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading products..." />;
  }

  const productsList = Array.isArray(products) ? products : [];

  return (
    <section className="space-y-8 font-sans lg:space-y-10">
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 lg:text-5xl">Products</h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Browse available products and stock levels.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {productsList.map((product) => (
          <article
            key={product._id}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/20 dark:hover:border-indigo-500/60"
          >
            <ProductImage
              src={product.image}
              alt={getProductName(product)}
              className="h-60 rounded-none border-x-0 border-t-0 sm:h-64"
            />

            <div className="flex items-start justify-between gap-4 p-5 pb-0">
              <div>
                <h2 className="font-display font-bold text-slate-950 dark:text-slate-100">
                  {getProductName(product)}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {product.category ? categoryName(product.category) : "Uncategorized"}
                </p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {product.stock} in stock
              </span>
            </div>

            <p className="mt-4 line-clamp-3 min-h-15 px-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {getProductDescription(product.description)}
            </p>

            <div className="mt-5 flex items-center justify-between gap-4 px-5">
              <p className="font-mono text-lg font-bold tabular-nums text-slate-950 dark:text-slate-100">
                {formatCurrency(product.price)}
              </p>
              <span
                className={[
                  "rounded-md px-2.5 py-1 text-xs font-semibold",
                  product.stock > 0
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
                ].join(" ")}
              >
                {product.stock > 0 ? "Available" : "Out of stock"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => openOrderDialog(product)}
              disabled={product.stock < 1 || orderingId === product._id}
              className="mx-5 mb-5 mt-5 min-h-11 w-[calc(100%-2.5rem)] rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              {orderingId === product._id ? "Creating order..." : "Order now"}
            </button>
          </article>
        ))}
      </div>

      {productsList.length === 0 && !error && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-400">
          No products found.
        </div>
      )}

      <Modal isOpen={Boolean(selectedProduct)} onClose={closeOrderDialog} title="Shipping address" size="md">
        <form onSubmit={handleOrderNow} className="space-y-5">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete the delivery details for <span className="font-semibold text-slate-950 dark:text-slate-100">{selectedProduct ? getProductName(selectedProduct) : "this product"}</span>.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["street", "Street and house number", "123 Main Street"],
              ["city", "City", "Milan"],
              ["zip", "ZIP / postal code", "20100"],
              ["country", "Country", "Italy"],
            ] as const).map(([name, label, placeholder]) => (
              <label key={name} className={name === "street" ? "sm:col-span-2" : ""}>
                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <input
                  name={name}
                  value={shippingAddress[name]}
                  onChange={handleAddressChange}
                  placeholder={placeholder}
                  disabled={Boolean(orderingId)}
                  required
                  autoComplete={name === "zip" ? "postal-code" : name === "street" ? "street-address" : name === "city" ? "address-level2" : "country-name"}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>
            ))}
          </div>

          {addressError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{addressError}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeOrderDialog} disabled={Boolean(orderingId)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={Boolean(orderingId)} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {orderingId ? "Creating order..." : "Confirm order"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default Products;
