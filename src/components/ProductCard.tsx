import { motion } from "framer-motion";
import { Icon } from "./Icon";
import type { Product } from "../data/products";

export function ProductCard({ product, onOpen, onAdd, onWish, wished }: { product: Product; onOpen: () => void; onAdd: () => void; onWish: () => void; wished: boolean }) {
  return (
    <motion.article layout whileHover={{ y: -10, rotateX: 2, rotateY: -2 }} transition={{ type: "spring", stiffness: 180, damping: 18 }} className="group relative overflow-hidden border border-gold/16 bg-white/[0.035] shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <button onClick={onWish} className={`absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-black/45 backdrop-blur-xl transition ${wished ? "text-gold" : "text-white/70 hover:text-gold"}`} aria-label="Wishlist">
        <Icon name="heart" className="h-5 w-5" />
      </button>
      <button onClick={onOpen} className="block w-full overflow-hidden text-left">
        <div className="aspect-[4/5] overflow-hidden bg-zinc-950">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover opacity-88 grayscale-[18%] transition duration-700 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0" />
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-gold/80">{product.category}</p>
              <h3 className="mt-2 text-xl font-medium text-white">{product.name}</h3>
            </div>
            <p className="text-lg text-white">${product.price.toLocaleString()}</p>
          </div>
          <p className="line-clamp-2 text-sm leading-6 text-white/55">{product.description}</p>
        </div>
      </button>
      <div className="px-5 pb-5">
        <button onClick={onAdd} className="w-full border border-gold/35 px-5 py-3 text-sm uppercase tracking-[0.24em] text-gold transition hover:bg-gold hover:text-black">Add to Cart</button>
      </div>
    </motion.article>
  );
}
