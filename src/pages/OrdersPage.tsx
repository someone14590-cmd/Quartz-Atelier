import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS, STOREFRONT_UPDATE_EVENT } from "../data/storefront";

type MemberProfile = {
  name?: string;
  email?: string;
};

type Order = {
  id: string;
  customer: string;
  customerEmail?: string;
  address?: string;
  payment?: string;
  total: number;
  items: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  date: string;
};

const MEMBER_AUTH_KEY = "quartz_member_authed";
const MEMBER_PROFILE_KEY = "quartz_member_profile";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readProfile = (): MemberProfile | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(MEMBER_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as MemberProfile) : null;
  } catch {
    return null;
  }
};

const readOrders = (): Order[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.orders);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
};

const filterOrdersForProfile = (orders: Order[], profile: MemberProfile | null): Order[] => {
  if (!profile) return [];
  const email = profile.email?.trim().toLowerCase();
  const name = profile.name?.trim().toLowerCase();
  return orders.filter((order) => {
    if (email && order.customerEmail?.toLowerCase() === email) return true;
    if (!email && name && order.customer?.toLowerCase() === name) return true;
    return false;
  });
};

const formatOrderDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      if (!canUseStorage()) return;
      const isAuthed = localStorage.getItem(MEMBER_AUTH_KEY) === "true";
      setAuthed(isAuthed);
      if (!isAuthed) {
        setOrders([]);
        return;
      }
      const profile = readProfile();
      const allOrders = readOrders();
      setOrders(filterOrdersForProfile(allOrders, profile));
    };

    loadOrders();
    window.addEventListener("storage", loadOrders);
    window.addEventListener(STOREFRONT_UPDATE_EVENT, loadOrders);
    return () => {
      window.removeEventListener("storage", loadOrders);
      window.removeEventListener(STOREFRONT_UPDATE_EVENT, loadOrders);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="section-shell">
        <p className="eyebrow">Account</p>
        <h1 className="section-title">Your Orders</h1>
        {authed ? (
          orders.length === 0 ? (
            <div className="mt-6 max-w-2xl text-white/55">
              <p>No orders yet. When you place an order, it will appear here.</p>
              <button onClick={() => navigate("/shop")} className="gold-button mt-8">Shop Now</button>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gold/12 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/50">{order.id}</p>
                      <p className="mt-2 text-sm text-white/60">Timestamp: {formatOrderDate(order.date)}</p>
                    </div>
                    <p className="text-lg text-white">${order.total.toLocaleString()}</p>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-white/55">
                    <p>{order.items} items</p>
                    <p>Status: <span className="text-white/80">{order.status}</span></p>
                    <p>Payment: <span className="text-white/80">{order.payment || "Not selected"}</span></p>
                    <p>Ship to: <span className="text-white/80">{order.address || "No address provided"}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )
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
