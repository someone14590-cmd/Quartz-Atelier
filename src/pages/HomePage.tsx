import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CrystalStage } from "../components/CrystalStage";
import { ProductCard } from "../components/ProductCard";
import { QuartzLogo } from "../components/QuartzLogo";
import type { Collection, Product } from "../data/products";

function Hero({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 170]);
  const opacity = useTransform(scrollY, [0, 540], [1, 0.2]);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-black pt-24">
      <div className="particles" aria-hidden="true" />
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <CrystalStage />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(212,175,55,0.16),transparent_28%),linear-gradient(180deg,rgba(10,10,10,0.24),#0A0A0A_87%)]" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl px-5 py-20 md:px-8">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="mx-auto max-w-4xl text-center">
          <motion.div animate={{ filter: ["drop-shadow(0 0 10px rgba(212,175,55,0.25))", "drop-shadow(0 0 32px rgba(212,175,55,0.45))", "drop-shadow(0 0 10px rgba(212,175,55,0.25))"] }} transition={{ duration: 3.8, repeat: Infinity }} className="mb-8 flex justify-center">
            <QuartzLogo />
          </motion.div>
          <h1 className="text-balance text-6xl font-semibold tracking-[-0.06em] text-white sm:text-7xl md:text-8xl lg:text-9xl">Luxury, Refined.</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/68 md:text-xl">Premium fashion and accessories crafted for modern elegance.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => onNavigate("/shop")} className="gold-button">Shop Now</button>
            <button onClick={() => onNavigate("/collections")} className="ghost-button">Explore Collection</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeaturedPreview({ products, onNavigate, onOpenProduct, addToCart, toggleWishlist, wishlist }: { products: Product[]; onNavigate: (path: string) => void; onOpenProduct: (product: Product) => void; addToCart: (product: Product) => void; toggleWishlist: (id: number) => void; wishlist: number[] }) {
  const preview = products.slice(0, 3);

  return (
    <section className="section-shell">
      <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Curated Objects</p>
          <h2 className="section-title">Featured Products</h2>
        </div>
        <button onClick={() => onNavigate("/shop")} className="ghost-button w-fit">View All <span className="ml-2 inline-block">→</span></button>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((product) => (
          <ProductCard key={product.id} product={product} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product.id)} onAdd={() => addToCart(product)} onOpen={() => onOpenProduct(product)} />
        ))}
      </div>
    </section>
  );
}

function CollectionsPreview({ collections, onNavigate }: { collections: Collection[]; onNavigate: (path: string) => void }) {
  const preview = collections.slice(0, 2);

  return (
    <section className="section-shell pt-10">
      <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Collections</p>
          <h2 className="section-title">Cinematic Essentials</h2>
        </div>
        <button onClick={() => onNavigate("/collections")} className="ghost-button w-fit">All Collections <span className="ml-2 inline-block">→</span></button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {preview.map((banner) => (
          <motion.article key={banner.slug} whileHover={{ scale: 0.985 }} className="group relative min-h-[520px] overflow-hidden bg-black" onClick={() => onNavigate("/collections")}>
            <img src={banner.image} alt={banner.title} className="absolute inset-0 h-full w-full object-cover opacity-58 transition duration-700 group-hover:scale-105 group-hover:opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <div className="absolute bottom-0 max-w-xl p-8 md:p-12">
              <h3 className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">{banner.title}</h3>
              <p className="mt-4 text-lg leading-8 text-white/64">{banner.text}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="section-shell grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <p className="eyebrow">3D Experience</p>
        <h2 className="section-title">A crystal interface for modern luxury.</h2>
        <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">Move your cursor across the object. QUARTZ uses ambient light, reflective material, and slow rotation to turn the logo form into a digital flagship moment.</p>
      </div>
      <div className="border border-gold/12 bg-white/[0.025] shadow-[0_50px_120px_rgba(0,0,0,0.5)]">
        <CrystalStage interactive />
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    ["The finish feels like a private showroom. Every detail is considered.", "Amara V.", "Verified Buyer"],
    ["Minimal, fast, beautiful. QUARTZ is the only accessories edit I trust.", "Julian R.", "Verified Buyer"],
    ["The watch arrived like a museum object. Quiet luxury done correctly.", "Selene K.", "Verified Buyer"],
    ["The checkout was instant and the product quality exceeded the imagery.", "Marco L.", "Verified Buyer"],
  ];

  return (
    <section className="overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow">Client Notes</p>
        <h2 className="section-title mb-12">Verified Elegance</h2>
      </div>
      <motion.div animate={{ x: [0, -620] }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} className="flex w-max gap-5 px-5 md:px-8">
        {[...reviews, ...reviews].map((review, index) => (
          <div key={`${review[1]}-${index}`} className="w-[320px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl md:w-[420px]">
            <p className="text-xl leading-8 text-white/82">"{review[0]}"</p>
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
              <p className="text-white">{review[1]}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-gold/80">{review[2]}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <section className="section-shell py-28 text-center">
      <p className="eyebrow">Private Access</p>
      <h2 className="section-title mx-auto max-w-3xl">Receive early releases and atelier notes.</h2>
      <form onSubmit={(e) => { e.preventDefault(); if (email) setJoined(true); }} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="min-h-14 flex-1 border border-white/10 bg-white/[0.04] px-5 text-white outline-none transition placeholder:text-white/35 focus:border-gold/50" />
        <button className="gold-button min-h-14" type="submit">Join</button>
      </form>
      {joined && <p className="mt-4 text-gold">Welcome to the QUARTZ private list.</p>}
    </section>
  );
}

export default function HomePage(props: { products: Product[]; collections: Collection[]; addToCart: (product: Product) => void; toggleWishlist: (id: number) => void; wishlist: number[] }) {
  const navigate = useNavigate();
  const go = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="bg-black">
      <Hero onNavigate={go} />
      <FeaturedPreview
        products={props.products}
        onNavigate={go}
        onOpenProduct={openProduct}
        addToCart={props.addToCart}
        toggleWishlist={props.toggleWishlist}
        wishlist={props.wishlist}
      />
      <CollectionsPreview collections={props.collections} onNavigate={go} />
      <Experience />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
