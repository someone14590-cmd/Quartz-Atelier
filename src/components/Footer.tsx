import { useNavigate } from "react-router-dom";
import { QuartzLogo } from "./QuartzLogo";

export function Footer() {
  const navigate = useNavigate();
  const quickLinks: { label: string; path: string }[] = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "Collections", path: "/collections" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Checkout", path: "/checkout" },
    { label: "Account", path: "/auth" },
  ];

  const go = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 bg-[#050505] px-5 py-14 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <QuartzLogo />
          <p className="mt-6 max-w-md text-sm leading-7 text-white/50">QUARTZ creates premium fashion and accessories with matte black restraint, soft gold precision, and modern digital craft.</p>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-[0.25em] text-gold">Quick Links</h4>
          <div className="mt-5 grid gap-3 text-white/58">
            {quickLinks.map((link) => <button key={link.path + link.label} onClick={() => go(link.path)} className="w-fit capitalize transition hover:text-gold">{link.label}</button>)}
          </div>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-[0.25em] text-gold">Social</h4>
          <div className="mt-5 flex gap-3">
            {['IG', 'X', 'YT'].map((item) => <a key={item} href="#" className="grid h-11 w-11 place-items-center border border-white/10 text-xs text-white/70 transition hover:border-gold hover:text-gold">{item}</a>)}
          </div>
          <p className="mt-8 text-xs text-white/35">Copyright 2026 QUARTZ. Terms and Privacy.</p>
        </div>
      </div>
    </footer>
  );
}
