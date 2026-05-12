import { useLocation, useNavigate } from "react-router-dom";
import { QuartzLogo } from "./QuartzLogo";
import { Icon } from "./Icon";

export function Navbar({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) {
  const navigate = useNavigate();
  const location = useLocation();
  const links: { label: string; path: string }[] = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "Collections", path: "/collections" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const go = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/shop") return location.pathname.startsWith("/shop") || location.pathname.startsWith("/product");
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-2xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <div onClick={() => go("/")}><QuartzLogo /></div>
        <div className="hidden items-center gap-9 lg:flex">
          {links.map((link) => (
            <button key={link.label} onClick={() => go(link.path)} className={`text-sm uppercase tracking-[0.22em] transition ${isActive(link.path) ? "text-gold" : "text-white/68 hover:text-gold"}`}>
              {link.label}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={() => go("/shop")} className="nav-icon" aria-label="Search"><Icon name="search" /></button>
          <button onClick={() => go("/checkout")} className="nav-icon relative" aria-label="Cart"><Icon name="cart" />{cartCount > 0 && <span className="badge">{cartCount}</span>}</button>
          <button onClick={() => go("/auth")} className="nav-icon relative" aria-label="Profile"><Icon name="user" />{wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}</button>
        </div>
      </nav>
    </header>
  );
}
