import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../data/products";

export default function ShopPage({ products, addToCart, toggleWishlist, wishlist }: { products: Product[]; addToCart: (product: Product) => void; toggleWishlist: (id: number) => void; wishlist: number[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    return ["All", ...unique];
  }, [products]);

  useEffect(() => {
    if (!categoryOptions.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, categoryOptions]);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (activeCategory === "All" || product.category === activeCategory) &&
          product.name.toLowerCase().includes(query.toLowerCase())
      ),
    [products, activeCategory, query]
  );

  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="section-shell">
        <div className="mb-16 max-w-3xl">
          <p className="eyebrow">The Edit</p>
          <h1 className="section-title">Shop All</h1>
          <p className="mt-6 text-lg leading-8 text-white/58">
            Every QUARTZ piece in one place. Filter by category, search by name, and discover the objects that complete your environment.
          </p>
        </div>
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="relative block lg:w-[420px]">
            <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search QUARTZ"
              className="w-full border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-white/35 focus:border-gold/50"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                  activeCategory === category
                    ? "bg-gold text-black"
                    : "border border-white/10 text-white/62 hover:border-gold/45 hover:text-gold"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wished={wishlist.includes(product.id)}
              onWish={() => toggleWishlist(product.id)}
              onAdd={() => addToCart(product)}
              onOpen={() => {
                navigate(`/product/${product.id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </motion.div>
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-2xl text-white/50">No products match your search.</p>
            <button onClick={() => { setQuery(""); setActiveCategory("All"); }} className="ghost-button mt-6">Clear Filters</button>
          </div>
        )}
      </section>
    </main>
  );
}
