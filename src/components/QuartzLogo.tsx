export function QuartzLogo({ compact = false }: { compact?: boolean }) {
  return (
    <button
      className="group flex items-center gap-3 text-left"
      aria-label="QUARTZ home"
      type="button"
    >
      <span className="relative grid h-11 w-11 place-items-center rounded-full border border-gold/35 bg-black/60 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
        <svg viewBox="0 0 64 64" className="h-8 w-8 text-gold transition-transform duration-500 group-hover:rotate-12">
          <path d="M32 4 54 18 48 48 32 60 16 48 10 18 32 4Z" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M10 18h44M16 48l16-30 16 30M32 4v56" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7" />
          <path d="M20 18 32 4l12 14-12 42Z" fill="currentColor" opacity=".18" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[1.45rem] font-semibold tracking-[0.28em] text-white">QUARTZ</span>
          <span className="block pt-1 text-[0.55rem] uppercase tracking-[0.45em] text-gold/80">Atelier</span>
        </span>
      )}
    </button>
  );
}
