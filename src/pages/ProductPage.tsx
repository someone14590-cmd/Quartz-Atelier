import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Product } from "../data/products";

export default function ProductPage({ products, addToCart, toggleWishlist, wishlist }: { products: Product[]; addToCart: (product: Product) => void; toggleWishlist: (id: number) => void; wishlist: number[] }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => products.find((item) => String(item.id) === productId), [productId, products]);

  if (!product) {
    return (
      <main className="min-h-screen bg-black pt-28">
        <section className="section-shell text-center">
          <p className="eyebrow">Not Found</p>
          <h1 className="section-title">This product is unavailable.</h1>
          <p className="mt-6 text-lg leading-8 text-white/58">Try browsing the full edit or return to the shop.</p>
          <button onClick={() => { navigate("/shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="gold-button mt-8">Return to Shop</button>
        </section>
      </main>
    );
  }

  const wished = wishlist.includes(product.id);

  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden border border-gold/12 bg-white/[0.03]">
          <img src={product.image} alt={product.name} className="h-full min-h-[520px] w-full object-cover" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
          <button onClick={() => { navigate("/shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mb-8 w-fit text-sm uppercase tracking-[0.22em] text-white/50 transition hover:text-gold">← Back to shop</button>
          <p className="eyebrow">{product.category}</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">{product.name}</h1>
          <p className="mt-6 text-3xl text-gold">${product.price.toLocaleString()}</p>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/62">{product.description}</p>
          <p className="mt-5 text-sm uppercase tracking-[0.22em] text-white/45">{product.material}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => addToCart(product)} className="gold-button">Add to Cart</button>
            <button onClick={() => toggleWishlist(product.id)} className="ghost-button">{wished ? "✓ Saved to Wishlist" : "Add to Wishlist"}</button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
