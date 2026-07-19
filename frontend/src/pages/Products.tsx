import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { InlineAlert, PageHeader } from "../components/PageLayout";
import { SearchInput } from "../components/SearchInput";
import { StockBadge } from "../components/StockBadge";

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
  const [query, setQuery] = useState("");

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

  const closeOrderDialog = useCallback((): void => {
    if (orderingId) return;
    setSelectedProduct(null);
    setAddressError("");
  }, [orderingId]);

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
  const visibleProducts = productsList.filter((product) => `${getProductName(product)} ${product.category ? categoryName(product.category) : ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="space-y-8 font-sans lg:space-y-10">
      <PageHeader title="Products" subtitle="Browse available products and stock levels." actions={<SearchInput onChange={setQuery} placeholder="Search products..." />} />

      {error && (
        <InlineAlert>{error}</InlineAlert>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <article
            key={product._id}
            className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/20 dark:hover:border-indigo-500/60"
          >
            <ProductImage
              src={product.image}
              alt={getProductName(product)}
              className="h-36 w-full shrink-0 rounded-b-none rounded-t-xl border-x-0 border-t-0 sm:h-40 lg:h-44"
            />

            <div className="flex items-start justify-between gap-2 px-4 pt-2">
              <div className="min-w-0">
                <h2 className="line-clamp-2 font-display font-bold leading-tight text-slate-950 dark:text-slate-100">
                  {getProductName(product)}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  {product.category ? categoryName(product.category) : "Uncategorized"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-medium tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:text-xs">
                {product.stock} in stock
              </span>
            </div>

            <p className="mt-1 line-clamp-2 px-4 text-sm leading-snug text-slate-600 dark:text-slate-400">
              {getProductDescription(product.description)}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3 px-4">
              <p className="font-mono text-lg font-bold tabular-nums text-slate-950 dark:text-slate-100">
                {formatCurrency(product.price)}
              </p>
              <StockBadge stock={product.stock} />
            </div>

            <Button
              type="button"
              onClick={() => openOrderDialog(product)}
              disabled={product.stock < 1 || orderingId === product._id}
              className="mx-4 mb-3 mt-2 min-h-9 w-[calc(100%-2rem)] py-1.5"
            >
              {orderingId === product._id ? "Creating order..." : "Order now"}
            </Button>
          </article>
        ))}
      </div>

      {visibleProducts.length === 0 && !error && <EmptyState title="No products found" message={query ? "Try a different search term." : "Products will appear here when they are available."} />}

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
