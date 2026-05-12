import type { ReactNode } from "react";

export function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    cart: <><path d="M6 6h15l-2 9H8L6 3H3" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.6-4 4.3-6 8-6s6.4 2 8 6" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    heart: <><path d="M20.8 4.6c-2-1.8-5.1-1.5-6.8.6L12 7.5l-2-2.3C8.3 3.1 5.2 2.8 3.2 4.6.8 6.8.7 10.5 3 12.9L12 22l9-9.1c2.3-2.4 2.2-6.1-.2-8.3Z" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.61.68 2.38a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.7-1.25a2 2 0 0 1 2.11-.45c.77.31 1.57.55 2.38.68A2 2 0 0 1 22 16.92Z" /></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    star: <><polygon points="12,2 15,8.5 22,9.3 17,14 18.2,21 12,17.8 5.8,21 7,14 2,9.3 9,8.5" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}
