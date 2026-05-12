import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { CartItem } from "../data/products";
import { emitStorefrontUpdate, loadShippingCharge, STORAGE_KEYS, STOREFRONT_UPDATE_EVENT } from "../data/storefront";

type MemberProfile = {
  name?: string;
  email?: string;
};

type OrderLineItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customer: string;
  customerEmail?: string;
  address: string;
  payment: string;
  total: number;
  items: number;
  lineItems?: OrderLineItem[];
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  date: string;
};

const PAYMENT_OPTIONS = ["BTC", "ETH", "USDT", "USDC", "LTC", "DOGE"] as const;
const MEMBER_PROFILE_KEY = "quartz_member_profile";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readOrders = (): Order[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.orders);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
};

const writeOrders = (orders: Order[]): boolean => {
  if (!canUseStorage()) return false;
  try {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
};

const readProfile = (): MemberProfile | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(MEMBER_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as MemberProfile) : null;
  } catch {
    return null;
  }
};

const createOrderId = (orders: Order[]): string => {
  const used = new Set(orders.map((order) => order.id));
  let next = "";
  do {
    next = `QZ-${Math.floor(100000 + Math.random() * 900000)}`;
  } while (used.has(next));
  return next;
};

export default function CheckoutPage({ cart, setCart }: { cart: CartItem[]; setCart: (cart: CartItem[]) => void }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [shippingCharge, setShippingCharge] = useState(() => loadShippingCharge());
  const shippingCost = subtotal ? shippingCharge : 0;
  const total = subtotal ? subtotal + shippingCharge : 0;
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<(typeof PAYMENT_OPTIONS)[number]>(PAYMENT_OPTIONS[0]);
  const [formError, setFormError] = useState("");
  const remove = (id: number) => setCart(cart.filter((item) => item.id !== id));
  const update = (id: number, quantity: number) => setCart(cart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));

  useEffect(() => {
    const syncShipping = () => setShippingCharge(loadShippingCharge());
    window.addEventListener("storage", syncShipping);
    window.addEventListener(STOREFRONT_UPDATE_EVENT, syncShipping);
    return () => {
      window.removeEventListener("storage", syncShipping);
      window.removeEventListener(STOREFRONT_UPDATE_EVENT, syncShipping);
    };
  }, []);

  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!subtotal) return;

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setFormError("Add your shipping address.");
      return;
    }

    const existingOrders = readOrders();
    const profile = readProfile();
    const customerName = profile?.name?.trim() || profile?.email?.split("@")[0] || "Guest";
    const customerEmail = profile?.email?.trim() || "";
    const order: Order = {
      id: createOrderId(existingOrders),
      customer: customerName,
      customerEmail,
      address: trimmedAddress,
      payment,
      total,
      items: cart.reduce((sum, item) => sum + item.quantity, 0),
      lineItems: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      status: "Pending",
      date: new Date().toISOString(),
    };

    const nextOrders = [order, ...existingOrders];
    if (!writeOrders(nextOrders)) {
      setFormError("Unable to save your order. Please try again.");
      return;
    }

    emitStorefrontUpdate();
    setCart([]);
    setAddress("");
    setPayment(PAYMENT_OPTIONS[0]);
    alert(`Order ${order.id} created. We will confirm your ${payment} payment soon.`);
  };

  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="eyebrow">Secure Checkout</p>
          <h1 className="section-title mb-10">Shopping Cart</h1>
          {cart.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
              <p className="text-2xl text-white/50">Your cart is empty.</p>
              <p className="mt-3 text-white/35">Add a QUARTZ piece from the Shop to begin checkout.</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {cart.map((item) => (
                <motion.div layout key={item.id} className="grid gap-4 border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[120px_1fr_auto]">
                  <img src={item.image} alt={item.name} className="h-32 w-full object-cover sm:w-32" />
                  <div>
                    <p className="text-xl text-white">{item.name}</p>
                    <p className="mt-2 text-sm text-white/45">{item.category}</p>
                    <button onClick={() => remove(item.id)} className="mt-4 text-sm text-gold/80 hover:text-gold">Remove</button>
                  </div>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <p className="text-white">${(item.price * item.quantity).toLocaleString()}</p>
                    <input type="number" min="1" value={item.quantity} onChange={(event) => update(item.id, Number(event.target.value))} className="w-20 border border-white/10 bg-black px-3 py-2 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <form className="h-fit border border-gold/18 bg-white/[0.035] p-6 backdrop-blur-xl" onSubmit={submitOrder}>
          <h2 className="text-2xl text-white">Order Summary</h2>
          <div className="mt-6 grid gap-3 border-b border-white/10 pb-6 text-white/60">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Insured shipping</span><span>${shippingCost.toLocaleString()}</span></div>
            <div className="flex justify-between text-white"><span>Total</span><span>${total.toLocaleString()}</span></div>
          </div>
          <div className="mt-6 grid gap-3">
            <input
              required
              placeholder="Shipping address"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                if (formError) setFormError("");
              }}
              className="form-input"
            />
            <select
              value={payment}
              onChange={(event) => setPayment(event.target.value as (typeof PAYMENT_OPTIONS)[number])}
              className="form-input form-select text-white/80"
              aria-label="Payment method"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {formError && <p className="text-xs text-red-300">{formError}</p>}
            <button disabled={!subtotal || !address.trim()} className="gold-button mt-2 disabled:cursor-not-allowed disabled:opacity-40">Complete Order</button>
          </div>
        </form>
      </section>
    </main>
  );
}
