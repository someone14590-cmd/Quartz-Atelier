import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
  paymentAmount: number;
  paymentAddress: string;
  paymentStatus: "unpaid" | "pending" | "confirmed";
  paymentTx?: string;
  paymentConfirmations?: number;
  paymentCheckedAt?: string;
  total: number;
  items: number;
  lineItems?: OrderLineItem[];
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  date: string;
};

const PAYMENT_OPTIONS = ["BTC", "ETH", "USDT", "USDC", "LTC", "DOGE"] as const;
const MEMBER_AUTH_KEY = "quartz_member_authed";
const MEMBER_PROFILE_KEY = "quartz_member_profile";
const MEMBER_EVENT = "quartz:member-auth";

const PAYMENT_ENV = import.meta.env as Record<string, string | undefined>;

const readEnvNumber = (key: string, fallback: number) => {
  const raw = PAYMENT_ENV[key];
  const value = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const readEnvString = (key: string) => {
  const raw = PAYMENT_ENV[key];
  return typeof raw === "string" ? raw.trim() : "";
};

const roundToDecimals = (value: number, decimals: number) => Number(value.toFixed(decimals));

const toBaseUnitsString = (value: number, decimals: number) => {
  const [whole, fraction = ""] = value.toFixed(decimals).split(".");
  const paddedFraction = `${fraction}${"0".repeat(decimals)}`.slice(0, decimals);
  return `${whole}${paddedFraction}`;
};

const ERC20_CONTRACTS = {
  USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
};

const buildPaymentUri = (coin: (typeof PAYMENT_OPTIONS)[number], address: string, amount: number, amountLabel: string) => {
  if (!address || !amount) return "";
  switch (coin) {
    case "BTC":
      return `bitcoin:${address}?amount=${amountLabel}`;
    case "LTC":
      return `litecoin:${address}?amount=${amountLabel}`;
    case "DOGE":
      return `dogecoin:${address}?amount=${amountLabel}`;
    case "ETH": {
      const wei = toBaseUnitsString(amount, 18);
      return `ethereum:${address}?value=${wei}`;
    }
    case "USDT": {
      const value = toBaseUnitsString(amount, 6);
      return `ethereum:${ERC20_CONTRACTS.USDT}/transfer?address=${address}&uint256=${value}`;
    }
    case "USDC": {
      const value = toBaseUnitsString(amount, 6);
      return `ethereum:${ERC20_CONTRACTS.USDC}/transfer?address=${address}&uint256=${value}`;
    }
    default:
      return `${address}?amount=${amountLabel}`;
  }
};

const PAYMENT_CONFIG = {
  BTC: {
    address: readEnvString("VITE_PAY_ADDR_BTC"),
    usdRate: readEnvNumber("VITE_PAY_RATE_BTC", 0),
    decimals: 8,
  },
  ETH: {
    address: readEnvString("VITE_PAY_ADDR_ETH"),
    usdRate: readEnvNumber("VITE_PAY_RATE_ETH", 0),
    decimals: 6,
  },
  USDT: {
    address: readEnvString("VITE_PAY_ADDR_USDT"),
    usdRate: readEnvNumber("VITE_PAY_RATE_USDT", 1),
    decimals: 2,
  },
  USDC: {
    address: readEnvString("VITE_PAY_ADDR_USDC"),
    usdRate: readEnvNumber("VITE_PAY_RATE_USDC", 1),
    decimals: 2,
  },
  LTC: {
    address: readEnvString("VITE_PAY_ADDR_LTC"),
    usdRate: readEnvNumber("VITE_PAY_RATE_LTC", 0),
    decimals: 8,
  },
  DOGE: {
    address: readEnvString("VITE_PAY_ADDR_DOGE"),
    usdRate: readEnvNumber("VITE_PAY_RATE_DOGE", 0),
    decimals: 8,
  },
} as const;

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
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [shippingCharge, setShippingCharge] = useState(() => loadShippingCharge());
  const shippingCost = subtotal ? shippingCharge : 0;
  const total = subtotal ? subtotal + shippingCharge : 0;
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<(typeof PAYMENT_OPTIONS)[number]>(PAYMENT_OPTIONS[0]);
  const [formError, setFormError] = useState("");
  const [authed, setAuthed] = useState(false);
  const remove = (id: number) => setCart(cart.filter((item) => item.id !== id));
  const update = (id: number, quantity: number) => setCart(cart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));
  const paymentConfig = PAYMENT_CONFIG[payment];
  const paymentAddress = paymentConfig.address;
  const paymentAmount = total && paymentConfig.usdRate > 0
    ? roundToDecimals(total / paymentConfig.usdRate, paymentConfig.decimals)
    : 0;
  const amountLabel = paymentAmount ? paymentAmount.toFixed(paymentConfig.decimals) : "";
  const paymentReady = Boolean(paymentAddress) && paymentAmount > 0;
  const paymentUri = paymentReady ? buildPaymentUri(payment, paymentAddress, paymentAmount, amountLabel) : "";
  const qrUrl = paymentUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(paymentUri)}`
    : "";

  useEffect(() => {
    const syncShipping = () => setShippingCharge(loadShippingCharge());
    window.addEventListener("storage", syncShipping);
    window.addEventListener(STOREFRONT_UPDATE_EVENT, syncShipping);
    return () => {
      window.removeEventListener("storage", syncShipping);
      window.removeEventListener(STOREFRONT_UPDATE_EVENT, syncShipping);
    };
  }, []);

  useEffect(() => {
    const syncAuth = () => setAuthed(localStorage.getItem(MEMBER_AUTH_KEY) === "true");
    if (typeof window === "undefined") return undefined;
    syncAuth();
    window.addEventListener("storage", syncAuth);
    window.addEventListener(MEMBER_EVENT, syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener(MEMBER_EVENT, syncAuth);
    };
  }, []);

  const submitOrder = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!subtotal) return;
    if (!authed) {
      setFormError("Sign in to place an order.");
      return;
    }
    if (!paymentReady) {
      setFormError(`Payment address not configured for ${payment}.`);
      return;
    }

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
      paymentAmount,
      paymentAddress,
      paymentStatus: "unpaid",
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
            {!authed && (
              <div className="border border-white/10 bg-white/[0.03] p-3 text-sm text-white/60">
                Sign in to complete checkout.
                <button type="button" onClick={() => navigate("/auth")} className="ml-3 text-gold/80 hover:text-gold">
                  Sign In
                </button>
              </div>
            )}
            <input
              required
              placeholder="Shipping address"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                if (formError) setFormError("");
              }}
              className="form-input"
              disabled={!authed}
            />
            <select
              value={payment}
              onChange={(event) => setPayment(event.target.value as (typeof PAYMENT_OPTIONS)[number])}
              className="form-input form-select text-white/80"
              aria-label="Payment method"
              disabled={!authed}
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {authed && (
              paymentReady ? (
                <div className="border border-white/10 bg-white/[0.03] p-3 text-xs text-white/65">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">Payment Instructions</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr] sm:items-center">
                    {qrUrl && (
                      <img
                        src={qrUrl}
                        alt={`${payment} payment QR code`}
                        className="h-[220px] w-[220px] border border-white/10 bg-black p-2"
                        loading="lazy"
                      />
                    )}
                    <div>
                      <p>Send exactly <span className="text-white">{amountLabel}</span> {payment} to:</p>
                      <p className="mt-2 break-all text-white/45">{paymentAddress}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/45">URI</p>
                      <p className="mt-1 break-all text-white/45">{paymentUri}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-300">Payment address not configured for {payment}.</p>
              )
            )}
            {formError && <p className="text-xs text-red-300">{formError}</p>}
            <button disabled={!subtotal || !address.trim() || !authed || !paymentReady} className="gold-button mt-2 disabled:cursor-not-allowed disabled:opacity-40">Complete Order</button>
          </div>
        </form>
      </section>
    </main>
  );
}
