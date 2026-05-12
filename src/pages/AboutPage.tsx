import { motion } from "framer-motion";
import { CrystalStage } from "../components/CrystalStage";
import type { AboutContent } from "../data/content";

export default function AboutPage({ content }: { content: AboutContent }) {
  const { hero, philosophy, values, timeline, highlights } = content;

  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="section-shell text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mx-auto max-w-4xl">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="section-title mx-auto max-w-3xl">{hero.title}</h1>
          <p className="mt-8 text-xl leading-9 text-white/60">{hero.lead}</p>
        </motion.div>
      </section>

      <section className="section-shell grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="eyebrow">{philosophy.eyebrow}</p>
          <h2 className="section-title">{philosophy.title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/58">{philosophy.paragraphs[0]}</p>
          <p className="mt-6 max-w-xl leading-8 text-white/42">{philosophy.paragraphs[1]}</p>
        </div>
        <div className="border border-gold/12 bg-white/[0.025] shadow-[0_50px_120px_rgba(0,0,0,0.5)]">
          <CrystalStage interactive />
        </div>
      </section>

      <section className="section-shell">
        <p className="eyebrow">What Guides Us</p>
        <h2 className="section-title mb-16">Core Values</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              viewport={{ once: true }}
              className="border border-gold/14 bg-white/[0.025] p-8 backdrop-blur-xl"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-gold">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 text-2xl font-semibold text-white">{value.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/52">{value.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <p className="eyebrow">Milestones</p>
        <h2 className="section-title mb-16">Our Journey</h2>
        <div className="relative ml-4 border-l border-gold/20 pl-8 md:ml-8">
          {timeline.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative mb-12 last:mb-0"
            >
              <div className="absolute -left-[calc(2rem+4px)] top-1 grid h-8 w-8 place-items-center border border-gold/30 bg-black text-xs text-gold">{item.year}</div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/50">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell grid gap-5 md:grid-cols-2">
        {highlights.map((item) => (
          <div key={item.title} className="relative min-h-[420px] overflow-hidden bg-black">
            <img src={item.image} alt={item.alt} className="absolute inset-0 h-full w-full object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-0 p-8">
              <p className="eyebrow">{item.eyebrow}</p>
              <h3 className="text-3xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/50">{item.text}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
