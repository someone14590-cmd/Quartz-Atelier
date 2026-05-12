import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QuartzLogo } from "./QuartzLogo";
import { Icon } from "./Icon";

const MEMBER_AUTH_KEY = "quartz_member_authed";
const MEMBER_PROFILE_KEY = "quartz_member_profile";
const MEMBER_EVENT = "quartz:member-auth";

type MemberProfile = {
  name?: string;
  email?: string;
};

export function Navbar({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const links: { label: string; path: string }[] = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "Collections", path: "/collections" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const loadMember = () => {
    if (typeof window === "undefined") return;
    const authed = localStorage.getItem(MEMBER_AUTH_KEY) === "true";
    if (!authed) {
      setMemberProfile(null);
      return;
    }
    try {
      const raw = localStorage.getItem(MEMBER_PROFILE_KEY);
      setMemberProfile(raw ? (JSON.parse(raw) as MemberProfile) : { email: "" });
    } catch {
      setMemberProfile({ email: "" });
    }
  };

  const signOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(MEMBER_AUTH_KEY);
      localStorage.removeItem(MEMBER_PROFILE_KEY);
      window.dispatchEvent(new Event(MEMBER_EVENT));
    }
    setMemberProfile(null);
    setMenuOpen(false);
  };

  const go = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/shop") return location.pathname.startsWith("/shop") || location.pathname.startsWith("/product");
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    loadMember();
    if (typeof window === "undefined") return;
    window.addEventListener("storage", loadMember);
    window.addEventListener(MEMBER_EVENT, loadMember);
    return () => {
      window.removeEventListener("storage", loadMember);
      window.removeEventListener(MEMBER_EVENT, loadMember);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

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
          {memberProfile ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="nav-icon relative"
                aria-label="Profile menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <Icon name="user" />
                {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 border border-white/10 bg-black/95 p-3 text-left text-sm text-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.3em] text-white/50">Account</p>
                  <button onClick={() => go("/orders")} className="w-full px-3 py-2 text-left text-sm text-white/80 transition hover:text-gold">
                    Your Orders
                  </button>
                  <button onClick={signOut} className="w-full px-3 py-2 text-left text-sm text-white/60 transition hover:text-gold">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => go("/auth")} className="nav-icon relative" aria-label="Profile"><Icon name="user" />{wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}</button>
          )}
        </div>
      </nav>
    </header>
  );
}
