import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/axios";
import type { Product } from "../types";
import Loader from "../components/Loader";
import ProductImage from "../components/ProductImage";
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

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderingId, setOrderingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      setError("");
      setLoading(true);

      try {
        const { data } = await api.get<Product[]>("/products");
        setProducts(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load products"));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleOrderNow = async (product: Product): Promise<void> => {
    if (product.stock < 1) {
      toast.error("This product is out of stock.");
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

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Products</h1>
        <p className="text-sm text-slate-500">
          Browse available products and stock levels.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product._id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <ProductImage
              src={product.image}
              alt={getProductName(product)}
              className="h-60 rounded-none border-x-0 border-t-0 sm:h-64"
            />

            <div className="flex items-start justify-between gap-4 p-5 pb-0">
              <div>
                <h2 className="font-semibold text-slate-950">
                  {getProductName(product)}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {categoryName(product.category)}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {product.stock} in stock
              </span>
            </div>

            <p className="mt-4 line-clamp-3 px-5 text-sm text-slate-600">
              {getProductDescription(product.description)}
            </p>

            <div className="mt-5 flex items-center justify-between gap-4 px-5">
              <p className="text-lg font-bold text-slate-950">
                {formatCurrency(product.price)}
              </p>
              <span
                className={[
                  "rounded-md px-2.5 py-1 text-xs font-semibold",
                  product.stock > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
                ].join(" ")}
              >
                {product.stock > 0 ? "Available" : "Out of stock"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleOrderNow(product)}
              disabled={product.stock < 1 || orderingId === product._id}
              className="mx-5 mb-5 mt-5 w-[calc(100%-2.5rem)] rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              {orderingId === product._id ? "Creating order..." : "Order now"}
            </button>
          </article>
        ))}
      </div>

      {products.length === 0 && !error && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No products found.
        </div>
      )}
    </section>
  );
};

export default Products;
