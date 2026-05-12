import { motion } from "framer-motion";
import { CrystalStage } from "../components/CrystalStage";
import type { Collection } from "../data/products";

export default function CollectionsPage({ collections }: { collections: Collection[] }) {
  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="section-shell">
        <div className="mb-16 max-w-3xl">
          <p className="eyebrow">The Archive</p>
          <h1 className="section-title">Collections</h1>
          <p className="mt-6 text-lg leading-8 text-white/58">
            Each QUARTZ collection tells a different story. From midnight tailoring to quiet luxury, these capsules define modern premium style.
          </p>
        </div>
      </section>

      {collections.map((collection, i) => (
        <section key={collection.slug} className={`section-shell ${i % 2 === 0 ? "" : "py-0"}`}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.2 }}
            className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 !== 0 ? "lg:grid-flow-dense" : ""}`}
          >
            <div className={`group relative overflow-hidden ${i % 2 !== 0 ? "lg:col-start-2" : ""}`}>
              <div className="aspect-[4/3] overflow-hidden bg-zinc-950">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105 group-hover:opacity-85"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className={i % 2 !== 0 ? "lg:col-start-1 lg:row-start-1" : ""}>
              <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="text-5xl font-semibold tracking-[-0.05em] text-white md:text-6xl lg:text-7xl">{collection.title}</h2>
              <p className="mt-6 text-lg leading-8 text-white/58">{collection.text}</p>
              <p className="mt-6 max-w-lg leading-8 text-white/42">{collection.description}</p>
            </div>
          </motion.div>
        </section>
      ))}

      <section className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div>
            <p className="eyebrow">Digital Atelier</p>
            <h2 className="section-title">A crystal interface for modern luxury.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Move your cursor across the 3D object. QUARTZ uses ambient light, reflective material, and slow rotation to create a living digital flagship moment.
            </p>
          </div>
          <div className="border border-gold/12 bg-white/[0.025] shadow-[0_50px_120px_rgba(0,0,0,0.5)]">
            <CrystalStage interactive />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
