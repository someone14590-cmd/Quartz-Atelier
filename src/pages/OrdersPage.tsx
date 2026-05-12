import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MEMBER_AUTH_KEY = "quartz_member_authed";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAuthed(localStorage.getItem(MEMBER_AUTH_KEY) === "true");
  }, []);

  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="section-shell">
        <p className="eyebrow">Account</p>
        <h1 className="section-title">Your Orders</h1>
        {authed ? (
          <div className="mt-6 max-w-2xl text-white/55">
            <p>No orders yet. When you place an order, it will appear here.</p>
            <button onClick={() => navigate("/shop")} className="gold-button mt-8">Shop Now</button>
          </div>
        ) : (
          <div className="mt-6 max-w-2xl text-white/55">
            <p>Sign in to view your orders.</p>
            <button onClick={() => navigate("/auth")} className="gold-button mt-8">Sign In</button>
          </div>
        )}
      </section>
    </main>
  );
}
