import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { aboutContent, contactContent } from "../data/content";
import { categories, collections, products } from "../data/products";
import type { Collection, Product } from "../data/products";
import { DEFAULT_SHIPPING_CHARGE, emitStorefrontUpdate, loadAboutContent, loadCollections, loadContactContent, loadProducts, loadShippingCharge, STORAGE_KEYS, STOREFRONT_UPDATE_EVENT } from "../data/storefront";
import { fetchChatMessages, markVisitorMessagesRead, sendChatMessage, subscribeToChatMessages } from "../data/chat";
import type { ChatMessage } from "../data/chat";

const DEV_PASSWORD = "quartz";
const AUTH_KEY = "quartz_admin_authed";
const ADMIN_ENDPOINT = "/api/admin-login";

type AdminSection = "products" | "collections" | "orders" | "customers" | "content" | "chat";

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
  address?: string;
  payment?: string;
  total: number;
  items: number;
  lineItems?: OrderLineItem[];
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  date: string;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  tier: string;
  lastOrder: string;
  lifetime: number;
};

const initialOrders: Order[] = [
  {
    id: "QZ-1041",
    customer: "Amara V.",
    customerEmail: "amara@example.com",
    address: "19 Rue de Rivoli, Paris, FR",
    payment: "BTC",
    total: 1480,
    items: 1,
    lineItems: [
      { id: 1, name: "Aurum Chronograph", quantity: 1, price: 1480 },
    ],
    status: "Processing",
    date: "2026-04-28T14:12:00Z",
  },
  {
    id: "QZ-1042",
    customer: "Julian R.",
    customerEmail: "julian@example.com",
    address: "88 Spring St, New York, NY",
    payment: "USDC",
    total: 920,
    items: 1,
    lineItems: [
      { id: 2, name: "Noir Tailored Coat", quantity: 1, price: 920 },
    ],
    status: "Pending",
    date: "2026-04-30T10:44:00Z",
  },
  {
    id: "QZ-1043",
    customer: "Selene K.",
    customerEmail: "selene@example.com",
    address: "104 Collins St, Melbourne, AU",
    payment: "ETH",
    total: 1820,
    items: 2,
    lineItems: [
      { id: 5, name: "Solstice Ring", quantity: 1, price: 1180 },
      { id: 8, name: "Orion Chain Bracelet", quantity: 1, price: 640 },
    ],
    status: "Shipped",
    date: "2026-05-02T19:08:00Z",
  },
  {
    id: "QZ-1044",
    customer: "Marco L.",
    customerEmail: "marco@example.com",
    address: "55 King St, Toronto, CA",
    payment: "LTC",
    total: 475,
    items: 1,
    lineItems: [
      { id: 9, name: "Carbon Derby", quantity: 1, price: 475 },
    ],
    status: "Delivered",
    date: "2026-05-04T16:25:00Z",
  },
];

const initialCustomers: Customer[] = [
  { id: "C-220", name: "Amara V.", email: "amara@example.com", tier: "Collector", lastOrder: "2026-04-28", lifetime: 6420 },
  { id: "C-221", name: "Julian R.", email: "julian@example.com", tier: "Member", lastOrder: "2026-04-30", lifetime: 1920 },
  { id: "C-222", name: "Selene K.", email: "selene@example.com", tier: "Collector", lastOrder: "2026-05-02", lifetime: 8710 },
  { id: "C-223", name: "Marco L.", email: "marco@example.com", tier: "Member", lastOrder: "2026-05-04", lifetime: 1540 },
];

const sectionOptions: { key: AdminSection; label: string }[] = [
  { key: "products", label: "Products" },
  { key: "collections", label: "Collections" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "content", label: "Content" },
  { key: "chat", label: "Chat" },
];

const categoryOptions = categories.filter((category) => category !== "All");

const cloneProducts = (items: Product[]) => items.map((item) => ({ ...item }));
const cloneCollections = (items: Collection[]) => items.map((item) => ({ ...item }));

const readLocal = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const makeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatOrderDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<AdminSection>("products");
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const [productDrafts, setProductDrafts] = useState<Product[]>(() => loadProducts());
  const [collectionDrafts, setCollectionDrafts] = useState<Collection[]>(() => loadCollections());
  const [orders, setOrders] = useState<Order[]>(() => readLocal(STORAGE_KEYS.orders, initialOrders));
  const [customers, setCustomers] = useState<Customer[]>(() => readLocal(STORAGE_KEYS.customers, initialCustomers));
  const [shippingCharge, setShippingCharge] = useState(() => loadShippingCharge());
  const [aboutDraft, setAboutDraft] = useState(loadAboutContent());
  const [contactDraft, setContactDraft] = useState(loadContactContent());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [chatError, setChatError] = useState("");

  const orderedChat = useMemo(
    () => [...chatMessages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [chatMessages]
  );

  const sessions = useMemo(() => {
    const map = new Map<string, { sessionId: string; name: string; email: string; lastAt: number; unread: number }>();
    for (const message of chatMessages) {
      const existing = map.get(message.session_id) ?? {
        sessionId: message.session_id,
        name: message.name || "Guest",
        email: message.email || "",
        lastAt: new Date(message.created_at).getTime(),
        unread: 0,
      };
      const lastAt = Math.max(existing.lastAt, new Date(message.created_at).getTime());
      const unread = message.sender === "visitor" && message.status === "new" ? existing.unread + 1 : existing.unread;
      const name = message.sender === "visitor" && message.name ? message.name : existing.name;
      const email = message.sender === "visitor" && message.email ? message.email : existing.email;
      map.set(message.session_id, { sessionId: message.session_id, name, email, lastAt, unread });
    }
    return Array.from(map.values()).sort((a, b) => b.lastAt - a.lastAt);
  }, [chatMessages]);

  const activeMessages = useMemo(
    () => orderedChat.filter((message) => message.session_id === activeSession),
    [orderedChat, activeSession]
  );

  useEffect(() => {
    setAuthed(localStorage.getItem(AUTH_KEY) === "true");
    setProductDrafts(loadProducts());
    setCollectionDrafts(loadCollections());
    setAboutDraft(loadAboutContent());
    setContactDraft(loadContactContent());
    setOrders(readLocal(STORAGE_KEYS.orders, initialOrders));
    setCustomers(readLocal(STORAGE_KEYS.customers, initialCustomers));
    setShippingCharge(loadShippingCharge());
  }, []);

  useEffect(() => {
    const syncOrders = () => setOrders(readLocal(STORAGE_KEYS.orders, initialOrders));
    window.addEventListener("storage", syncOrders);
    window.addEventListener(STOREFRONT_UPDATE_EVENT, syncOrders);
    return () => {
      window.removeEventListener("storage", syncOrders);
      window.removeEventListener(STOREFRONT_UPDATE_EVENT, syncOrders);
    };
  }, []);

  const refreshChat = async () => {
    const data = await fetchChatMessages("admin");
    setChatMessages(data);
  };

  const toggleOrderItems = (orderId: string) => {
    setExpandedOrders((current) => ({ ...current, [orderId]: !current[orderId] }));
  };

  useEffect(() => {
    refreshChat();
    const unsubscribe = subscribeToChatMessages("admin", refreshChat);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeSession && sessions.length > 0) {
      setActiveSession(sessions[0].sessionId);
    }
  }, [activeSession, sessions]);

  const pushNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushNotice(`${label} copied.`);
    } catch {
      pushNotice("Copy failed. Select and copy manually.");
    }
  };

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(ADMIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        localStorage.setItem(AUTH_KEY, "true");
        setAuthed(true);
        setPassword("");
        return;
      }

      if (response.status === 401) {
        setError("Incorrect password.");
        return;
      }
    } catch {
      // Fall back to dev password for local usage.
    }

    if (password === DEV_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setAuthed(true);
      setPassword("");
      return;
    }

    setError("Incorrect password.");
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword("");
    setError("");
  };

  const updateProduct = (id: number, patch: Partial<Product>) => {
    setProductDrafts((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addProduct = () => {
    const maxId = productDrafts.reduce((max, item) => Math.max(max, item.id), 0);
    const nextId = maxId + 1;
    setProductDrafts((current) => [
      {
        id: nextId,
        name: "New Product",
        category: categoryOptions[0] ?? "Accessories",
        price: 100,
        description: "",
        image: "",
        material: "",
      },
      ...current,
    ]);
    pushNotice("Product added. Save drafts to apply.");
  };

  const removeProduct = (id: number) => {
    setProductDrafts((current) => current.filter((item) => item.id !== id));
  };

  const handleImageUpload = (file: File | null, onSuccess: (dataUrl: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      pushNotice("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      pushNotice("Image too large. Use a file under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onSuccess(result);
      }
    };
    reader.onerror = () => pushNotice("Image upload failed.");
    reader.readAsDataURL(file);
  };

  const handleProductImageUpload = (id: number, file: File | null) => {
    handleImageUpload(file, (dataUrl) => updateProduct(id, { image: dataUrl }));
  };

  const handleCollectionImageUpload = (slug: string, file: File | null) => {
    handleImageUpload(file, (dataUrl) => updateCollection(slug, { image: dataUrl }));
  };

  const saveDrafts = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(productDrafts));
      localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collectionDrafts));
      localStorage.setItem(STORAGE_KEYS.about, JSON.stringify(aboutDraft));
      localStorage.setItem(STORAGE_KEYS.contact, JSON.stringify(contactDraft));
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
      localStorage.setItem(STORAGE_KEYS.shipping, JSON.stringify(shippingCharge));
      emitStorefrontUpdate();
      pushNotice("Drafts saved locally.");
    } catch {
      pushNotice("Save failed. Clear some images or reduce size.");
    }
  };

  const updateCollection = (slug: string, patch: Partial<Collection>) => {
    setCollectionDrafts((current) => current.map((item) => (item.slug === slug ? { ...item, ...patch } : item)));
  };

  const addCollection = () => {
    const nextIndex = collectionDrafts.length + 1;
    setCollectionDrafts((current) => [
      ...current,
      {
        slug: `new-collection-${nextIndex}`,
        title: "New Collection",
        text: "Short collection summary.",
        image: "",
        description: "",
      },
    ]);
  };

  const removeCollection = (slug: string) => {
    setCollectionDrafts((current) => current.filter((item) => item.slug !== slug));
  };

  const updateCustomer = (id: string, patch: Partial<Customer>) => {
    setCustomers((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addCustomer = () => {
    setCustomers((current) => {
      const maxId = current.reduce((max, item) => {
        const match = item.id.match(/\d+/);
        const value = match ? Number(match[0]) : 0;
        return Math.max(max, value);
      }, 0);
      const nextId = `C-${String(maxId + 1).padStart(3, "0")}`;
      const today = new Date().toISOString().slice(0, 10);
      return [
        {
          id: nextId,
          name: "New Client",
          email: "",
          tier: "Member",
          lastOrder: today,
          lifetime: 0,
        },
        ...current,
      ];
    });
    pushNotice("Customer added. Save drafts to apply.");
  };

  const removeCustomer = (id: string) => {
    setCustomers((current) => current.filter((item) => item.id !== id));
  };

  const resetDrafts = () => {
    setProductDrafts(cloneProducts(products));
    setCollectionDrafts(cloneCollections(collections));
    setAboutDraft(aboutContent);
    setContactDraft(contactContent);
    setOrders(initialOrders);
    setCustomers(initialCustomers);
    setShippingCharge(DEFAULT_SHIPPING_CHARGE);
    localStorage.removeItem(STORAGE_KEYS.products);
    localStorage.removeItem(STORAGE_KEYS.collections);
    localStorage.removeItem(STORAGE_KEYS.about);
    localStorage.removeItem(STORAGE_KEYS.contact);
    localStorage.removeItem(STORAGE_KEYS.orders);
    localStorage.removeItem(STORAGE_KEYS.customers);
    localStorage.removeItem(STORAGE_KEYS.shipping);
    emitStorefrontUpdate();
    pushNotice("Drafts reset.");
  };

  const unreadCount = chatMessages.filter((message) => message.sender === "visitor" && message.status === "new").length;

  const markChatRead = async () => {
    await markVisitorMessagesRead(activeSession ?? undefined);
    refreshChat();
  };

  const sendAdminReply = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = adminReply.trim();
    if (!trimmed) return;
    if (!activeSession) {
      setChatError("Select a conversation first.");
      return;
    }
    const ok = await sendChatMessage({
      sessionId: activeSession,
      name: "Quartz Team",
      email: "admin@quartz",
      message: trimmed,
      sender: "admin",
    });
    if (!ok) {
      setChatError("Reply failed. Try again.");
      return;
    }
    setAdminReply("");
    setChatError("");
    refreshChat();
  };

  const productsJson = useMemo(() => JSON.stringify(productDrafts, null, 2), [productDrafts]);
  const collectionsJson = useMemo(() => JSON.stringify(collectionDrafts, null, 2), [collectionDrafts]);
  const aboutJson = useMemo(() => JSON.stringify(aboutDraft, null, 2), [aboutDraft]);
  const contactJson = useMemo(() => JSON.stringify(contactDraft, null, 2), [contactDraft]);

  if (!authed) {
    return (
      <main className="min-h-screen bg-black pt-28">
        <section className="section-shell grid place-items-center">
          <form onSubmit={login} className="w-full max-w-lg border border-gold/16 bg-white/[0.035] p-8 backdrop-blur-2xl">
            <p className="eyebrow">Admin Access</p>
            <h1 className="section-title text-4xl">Enter the control room.</h1>
            <p className="mt-4 text-white/55">Use the password set in the admin panel file.</p>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin password"
              className="form-input mt-6"
            />
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            <button type="submit" className="gold-button mt-6">Enter Admin</button>
            <p className="mt-4 text-xs text-white/40">Set ADMIN_PASSWORD in Vercel. Local dev fallback: quartz.</p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black pt-24">
      <section className="section-shell">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Admin Panel</p>
            <h1 className="section-title">Quartz Control</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/58">
              Manage products, collections, content, and client activity. Drafts are local-only. Use export to update the repo data files.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="ghost-button">Back to Store</button>
            <button onClick={saveDrafts} className="gold-button">Save Drafts</button>
            <button onClick={resetDrafts} className="ghost-button">Reset Drafts</button>
            <button onClick={signOut} className="ghost-button">Sign Out</button>
          </div>
        </div>

        {notice && <div className="mb-6 border border-gold/30 bg-white/[0.05] px-4 py-3 text-sm text-gold">{notice}</div>}

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="border border-white/10 bg-white/[0.02] p-4">
            <div className="grid gap-2">
              {sectionOptions.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActive(section.key)}
                  className={`w-full px-4 py-3 text-left text-sm uppercase tracking-[0.22em] transition ${active === section.key ? "bg-gold text-black" : "border border-white/10 text-white/70 hover:border-gold/45 hover:text-gold"}`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            {active === "products" && (
              <section className="border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="eyebrow">Inventory</p>
                    <h2 className="text-3xl font-semibold text-white">Products</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={addProduct} className="ghost-button">Add Product</button>
                    <button onClick={() => copyText(productsJson, "Products JSON")} className="gold-button">Export JSON</button>
                  </div>
                </div>
                <div className="grid gap-6">
                  {productDrafts.map((product) => (
                    <div key={product.id} className="grid gap-6 border border-gold/12 bg-white/[0.03] p-5 lg:grid-cols-[160px_1fr]">
                      <div className="overflow-hidden bg-black">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-40 w-full object-cover" />
                        ) : (
                          <div className="grid h-40 place-items-center text-sm text-white/40">No image</div>
                        )}
                      </div>
                      <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <input value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })} className="form-input" placeholder="Product name" />
                          <select value={product.category} onChange={(event) => updateProduct(product.id, { category: event.target.value })} className="form-input text-white/70">
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            value={product.price}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              updateProduct(product.id, { price: Number.isFinite(value) ? value : 0 });
                            }}
                            className="form-input"
                            placeholder="Price"
                          />
                          <input value={product.material} onChange={(event) => updateProduct(product.id, { material: event.target.value })} className="form-input" placeholder="Material" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="ghost-button cursor-pointer">
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                handleProductImageUpload(product.id, file);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          {product.image && (
                            <button onClick={() => updateProduct(product.id, { image: "" })} className="ghost-button">Clear Image</button>
                          )}
                        </div>
                        <textarea value={product.description} onChange={(event) => updateProduct(product.id, { description: event.target.value })} rows={3} className="form-input resize-none" placeholder="Description" />
                        <div className="flex justify-between text-xs uppercase tracking-[0.22em] text-white/40">
                          <span>ID {product.id}</span>
                          <button onClick={() => removeProduct(product.id)} className="text-gold hover:text-gold/80">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === "collections" && (
              <section className="border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="eyebrow">Editorial</p>
                    <h2 className="text-3xl font-semibold text-white">Collections</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={addCollection} className="ghost-button">Add Collection</button>
                    <button onClick={() => copyText(collectionsJson, "Collections JSON")} className="gold-button">Export JSON</button>
                  </div>
                </div>
                <div className="grid gap-6">
                  {collectionDrafts.map((collection) => (
                    <div key={collection.slug} className="grid gap-6 border border-gold/12 bg-white/[0.03] p-5 lg:grid-cols-[160px_1fr]">
                      <div className="overflow-hidden bg-black">
                        {collection.image ? (
                          <img src={collection.image} alt={collection.title} className="h-40 w-full object-cover" />
                        ) : (
                          <div className="grid h-40 place-items-center text-sm text-white/40">No image</div>
                        )}
                      </div>
                      <div className="grid gap-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <input value={collection.title} onChange={(event) => updateCollection(collection.slug, { title: event.target.value })} className="form-input" placeholder="Title" />
                          <input
                            value={collection.slug}
                            onChange={(event) => updateCollection(collection.slug, { slug: makeSlug(event.target.value) || collection.slug })}
                            className="form-input"
                            placeholder="Slug"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="ghost-button cursor-pointer">
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                handleCollectionImageUpload(collection.slug, file);
                                event.currentTarget.value = "";
                              }}
                            />
                          </label>
                          {collection.image && (
                            <button onClick={() => updateCollection(collection.slug, { image: "" })} className="ghost-button">Clear Image</button>
                          )}
                        </div>
                        <input value={collection.text} onChange={(event) => updateCollection(collection.slug, { text: event.target.value })} className="form-input" placeholder="Short summary" />
                        <textarea value={collection.description} onChange={(event) => updateCollection(collection.slug, { description: event.target.value })} rows={3} className="form-input resize-none" placeholder="Description" />
                        <div className="flex justify-between text-xs uppercase tracking-[0.22em] text-white/40">
                          <span>{collection.slug}</span>
                          <button onClick={() => removeCollection(collection.slug)} className="text-gold hover:text-gold/80">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === "orders" && (
              <section className="border border-white/10 bg-white/[0.02] p-6">
                <p className="eyebrow">Operations</p>
                <h2 className="text-3xl font-semibold text-white">Orders</h2>
                <div className="mt-6 grid gap-4">
                  <div className="border border-gold/12 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/50">Shipping Charge</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr] md:items-center">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={shippingCharge}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setShippingCharge(Number.isFinite(value) ? Math.max(0, value) : 0);
                        }}
                        className="form-input"
                        aria-label="Shipping charge"
                      />
                      <p className="text-sm text-white/55">Applies to new checkout totals. Save Drafts to publish.</p>
                    </div>
                  </div>
                  {orders.map((order) => (
                    <div key={order.id} className="grid gap-4 border border-gold/12 bg-white/[0.03] p-5 md:grid-cols-[1.1fr_1fr_180px]">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-white/40">{order.id}</p>
                        <p className="mt-2 text-xl text-white">{order.customer}</p>
                        <p className="mt-2 text-sm text-white/50">{order.items} items</p>
                        <p className="mt-2 text-sm text-white/50">{order.customerEmail || "No email"}</p>
                        <p className="mt-2 text-sm text-white/50">Timestamp: {formatOrderDate(order.date)}</p>
                      </div>
                      <div className="grid content-start gap-2 text-sm text-white/55">
                        <p className="text-lg text-white">${order.total.toLocaleString()}</p>
                        <p>Payment: <span className="text-white/80">{order.payment || "Not selected"}</span></p>
                        <p>Ship to: <span className="text-white/80">{order.address || "No address provided"}</span></p>
                        <button
                          type="button"
                          onClick={() => toggleOrderItems(order.id)}
                          className="mt-2 text-left text-[10px] uppercase tracking-[0.22em] text-gold/80 hover:text-gold"
                        >
                          {expandedOrders[order.id] ? "Hide items" : `Items (${order.items})`}
                        </button>
                        {expandedOrders[order.id] && (
                          order.lineItems && order.lineItems.length > 0 ? (
                            <div className="mt-2 grid gap-1">
                              {order.lineItems.map((item) => (
                                <div key={`${order.id}-${item.id}`} className="flex items-center justify-between text-xs text-white/70">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>${(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-white/50">No item details available.</p>
                          )
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-3 text-right text-sm text-white/45 md:items-start md:text-left">
                        <select
                          value={order.status}
                          onChange={(event) =>
                            setOrders((current) =>
                              current.map((item) => (item.id === order.id ? { ...item, status: event.target.value as Order["status"] } : item))
                            )
                          }
                          className="form-input text-white/70"
                        >
                          {["Pending", "Processing", "Shipped", "Delivered"].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <p>Last update: {formatOrderDate(order.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === "customers" && (
              <section className="border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="eyebrow">Clients</p>
                    <h2 className="text-3xl font-semibold text-white">Customers</h2>
                    <p className="mt-2 text-sm text-white/50">Add, edit, or remove customer details. Save drafts to keep changes.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={addCustomer} className="ghost-button">Add Customer</button>
                  </div>
                </div>
                <div className="grid gap-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="grid gap-4 border border-gold/12 bg-white/[0.03] p-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={customer.name}
                          onChange={(event) => updateCustomer(customer.id, { name: event.target.value })}
                          className="form-input"
                          placeholder="Name"
                        />
                        <input
                          value={customer.email}
                          onChange={(event) => updateCustomer(customer.id, { email: event.target.value })}
                          className="form-input"
                          placeholder="Email"
                          type="email"
                        />
                        <input
                          value={customer.tier}
                          onChange={(event) => updateCustomer(customer.id, { tier: event.target.value })}
                          className="form-input"
                          placeholder="Tier"
                        />
                        <input
                          value={customer.lastOrder}
                          onChange={(event) => updateCustomer(customer.id, { lastOrder: event.target.value })}
                          className="form-input"
                          type="date"
                        />
                        <input
                          value={customer.lifetime}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            updateCustomer(customer.id, { lifetime: Number.isFinite(value) ? value : 0 });
                          }}
                          className="form-input"
                          placeholder="Lifetime spend"
                          type="number"
                          min="0"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/40">
                        <span>{customer.id}</span>
                        <button onClick={() => removeCustomer(customer.id)} className="text-gold hover:text-gold/80">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === "chat" && (
              <section className="border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="eyebrow">Live Support</p>
                    <h2 className="text-3xl font-semibold text-white">Realtime Chat</h2>
                    <p className="mt-2 text-sm text-white/50">Unread messages: {unreadCount}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={markChatRead} className="ghost-button">Mark Read</button>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                  <div className="border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Conversations</p>
                    <div className="mt-4 grid gap-2">
                      {sessions.length === 0 ? (
                        <p className="text-sm text-white/45">No sessions yet.</p>
                      ) : (
                        sessions.map((session) => (
                          <button
                            key={session.sessionId}
                            onClick={() => { setActiveSession(session.sessionId); setChatError(""); }}
                            className={`w-full border px-4 py-3 text-left text-sm transition ${activeSession === session.sessionId ? "border-gold/40 bg-gold/10 text-white" : "border-white/10 text-white/65 hover:border-gold/40"}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white">{session.name}</span>
                              {session.unread > 0 && <span className="badge">{session.unread}</span>}
                            </div>
                            <p className="mt-2 text-xs text-white/45">{session.email || "No email"}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="max-h-[420px] space-y-3 overflow-y-auto border border-white/10 bg-black/30 p-4">
                      {activeMessages.length === 0 ? (
                        <p className="text-sm text-white/45">Select a conversation to view messages.</p>
                      ) : (
                        activeMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[360px] border px-4 py-3 text-sm leading-6 ${message.sender === "admin" ? "border-gold/30 bg-gold/10 text-white" : "border-white/10 bg-white/[0.04] text-white/75"}`}>
                              <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                                {message.sender === "admin" ? "Quartz Team" : message.name}
                              </div>
                              <p className="mt-2">{message.message}</p>
                              <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                                {new Date(message.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={sendAdminReply} className="mt-6 grid gap-3">
                      <textarea
                        value={adminReply}
                        onChange={(event) => setAdminReply(event.target.value)}
                        rows={3}
                        placeholder={activeSession ? "Reply as Quartz Team" : "Select a conversation first"}
                        className="form-input resize-none"
                        disabled={!activeSession}
                      />
                      {chatError && <p className="text-xs text-red-300">{chatError}</p>}
                      <button className="gold-button" type="submit" disabled={!activeSession}>Send Reply</button>
                    </form>
                  </div>
                </div>
              </section>
            )}

            {active === "content" && (
              <section className="border border-white/10 bg-white/[0.02] p-6">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="eyebrow">Editorial</p>
                    <h2 className="text-3xl font-semibold text-white">Page Content</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => copyText(aboutJson, "About JSON")} className="ghost-button">Export About</button>
                    <button onClick={() => copyText(contactJson, "Contact JSON")} className="gold-button">Export Contact</button>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="border border-gold/12 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-gold/80">About Page</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <input value={aboutDraft.hero.eyebrow} onChange={(event) => setAboutDraft((current) => ({ ...current, hero: { ...current.hero, eyebrow: event.target.value } }))} className="form-input" placeholder="Hero eyebrow" />
                      <input value={aboutDraft.hero.title} onChange={(event) => setAboutDraft((current) => ({ ...current, hero: { ...current.hero, title: event.target.value } }))} className="form-input" placeholder="Hero title" />
                    </div>
                    <textarea value={aboutDraft.hero.lead} onChange={(event) => setAboutDraft((current) => ({ ...current, hero: { ...current.hero, lead: event.target.value } }))} rows={3} className="form-input mt-4 resize-none" placeholder="Hero lead" />
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <input value={aboutDraft.philosophy.eyebrow} onChange={(event) => setAboutDraft((current) => ({ ...current, philosophy: { ...current.philosophy, eyebrow: event.target.value } }))} className="form-input" placeholder="Philosophy eyebrow" />
                      <input value={aboutDraft.philosophy.title} onChange={(event) => setAboutDraft((current) => ({ ...current, philosophy: { ...current.philosophy, title: event.target.value } }))} className="form-input" placeholder="Philosophy title" />
                    </div>
                    <textarea value={aboutDraft.philosophy.paragraphs[0]} onChange={(event) => setAboutDraft((current) => ({ ...current, philosophy: { ...current.philosophy, paragraphs: [event.target.value, current.philosophy.paragraphs[1] ?? ""] } }))} rows={3} className="form-input mt-4 resize-none" placeholder="Philosophy paragraph 1" />
                    <textarea value={aboutDraft.philosophy.paragraphs[1]} onChange={(event) => setAboutDraft((current) => ({ ...current, philosophy: { ...current.philosophy, paragraphs: [current.philosophy.paragraphs[0] ?? "", event.target.value] } }))} rows={3} className="form-input mt-4 resize-none" placeholder="Philosophy paragraph 2" />
                    <div className="mt-6 grid gap-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Core Values</p>
                      {aboutDraft.values.map((value, index) => (
                        <div key={value.title + index} className="grid gap-3 md:grid-cols-2">
                          <input value={value.title} onChange={(event) => setAboutDraft((current) => ({ ...current, values: current.values.map((item, i) => (i === index ? { ...item, title: event.target.value } : item)) }))} className="form-input" placeholder="Value title" />
                          <input value={value.text} onChange={(event) => setAboutDraft((current) => ({ ...current, values: current.values.map((item, i) => (i === index ? { ...item, text: event.target.value } : item)) }))} className="form-input" placeholder="Value text" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 grid gap-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Timeline</p>
                      {aboutDraft.timeline.map((item, index) => (
                        <div key={item.year + index} className="grid gap-3 md:grid-cols-[120px_1fr_1fr]">
                          <input value={item.year} onChange={(event) => setAboutDraft((current) => ({ ...current, timeline: current.timeline.map((entry, i) => (i === index ? { ...entry, year: event.target.value } : entry)) }))} className="form-input" placeholder="Year" />
                          <input value={item.title} onChange={(event) => setAboutDraft((current) => ({ ...current, timeline: current.timeline.map((entry, i) => (i === index ? { ...entry, title: event.target.value } : entry)) }))} className="form-input" placeholder="Title" />
                          <input value={item.text} onChange={(event) => setAboutDraft((current) => ({ ...current, timeline: current.timeline.map((entry, i) => (i === index ? { ...entry, text: event.target.value } : entry)) }))} className="form-input" placeholder="Summary" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-gold/12 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Contact Page</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <input value={contactDraft.hero.eyebrow} onChange={(event) => setContactDraft((current) => ({ ...current, hero: { ...current.hero, eyebrow: event.target.value } }))} className="form-input" placeholder="Hero eyebrow" />
                      <input value={contactDraft.hero.title} onChange={(event) => setContactDraft((current) => ({ ...current, hero: { ...current.hero, title: event.target.value } }))} className="form-input" placeholder="Hero title" />
                    </div>
                    <textarea value={contactDraft.hero.lead} onChange={(event) => setContactDraft((current) => ({ ...current, hero: { ...current.hero, lead: event.target.value } }))} rows={3} className="form-input mt-4 resize-none" placeholder="Hero lead" />
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <input value={contactDraft.officeSection.eyebrow} onChange={(event) => setContactDraft((current) => ({ ...current, officeSection: { ...current.officeSection, eyebrow: event.target.value } }))} className="form-input" placeholder="Office eyebrow" />
                      <input value={contactDraft.officeSection.title} onChange={(event) => setContactDraft((current) => ({ ...current, officeSection: { ...current.officeSection, title: event.target.value } }))} className="form-input" placeholder="Office title" />
                    </div>
                    <div className="mt-6 grid gap-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Offices</p>
                      {contactDraft.offices.map((office, index) => (
                        <div key={office.city + index} className="grid gap-3 md:grid-cols-2">
                          <input value={office.city} onChange={(event) => setContactDraft((current) => ({ ...current, offices: current.offices.map((item, i) => (i === index ? { ...item, city: event.target.value } : item)) }))} className="form-input" placeholder="City" />
                          <input value={office.address} onChange={(event) => setContactDraft((current) => ({ ...current, offices: current.offices.map((item, i) => (i === index ? { ...item, address: event.target.value } : item)) }))} className="form-input" placeholder="Address" />
                          <input value={office.phone} onChange={(event) => setContactDraft((current) => ({ ...current, offices: current.offices.map((item, i) => (i === index ? { ...item, phone: event.target.value } : item)) }))} className="form-input" placeholder="Phone" />
                          <input value={office.hours} onChange={(event) => setContactDraft((current) => ({ ...current, offices: current.offices.map((item, i) => (i === index ? { ...item, hours: event.target.value } : item)) }))} className="form-input" placeholder="Hours" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <input value={contactDraft.form.title} onChange={(event) => setContactDraft((current) => ({ ...current, form: { ...current.form, title: event.target.value } }))} className="form-input" placeholder="Form title" />
                      <input value={contactDraft.form.subtitle} onChange={(event) => setContactDraft((current) => ({ ...current, form: { ...current.form, subtitle: event.target.value } }))} className="form-input" placeholder="Form subtitle" />
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <input value={contactDraft.direct.eyebrow} onChange={(event) => setContactDraft((current) => ({ ...current, direct: { ...current.direct, eyebrow: event.target.value } }))} className="form-input" placeholder="Direct eyebrow" />
                      <input value={contactDraft.direct.title} onChange={(event) => setContactDraft((current) => ({ ...current, direct: { ...current.direct, title: event.target.value } }))} className="form-input" placeholder="Direct title" />
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <input value={contactDraft.direct.email} onChange={(event) => setContactDraft((current) => ({ ...current, direct: { ...current.direct, email: event.target.value } }))} className="form-input" placeholder="Email" />
                      <input value={contactDraft.direct.phoneDisplay} onChange={(event) => setContactDraft((current) => ({ ...current, direct: { ...current.direct, phoneDisplay: event.target.value } }))} className="form-input" placeholder="Phone display" />
                      <input value={contactDraft.direct.phoneHref} onChange={(event) => setContactDraft((current) => ({ ...current, direct: { ...current.direct, phoneHref: event.target.value } }))} className="form-input" placeholder="Phone href" />
                    </div>
                  </div>

                  <div className="border border-white/10 bg-white/[0.02] p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">JSON Preview</p>
                    <div className="mt-4 grid gap-4">
                      <textarea readOnly value={aboutJson} className="form-input min-h-[180px] resize-none font-mono text-xs text-white/70" />
                      <textarea readOnly value={contactJson} className="form-input min-h-[180px] resize-none font-mono text-xs text-white/70" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="border border-white/10 bg-white/[0.02] p-5 text-sm text-white/50">
              Save Drafts stores data in your browser only. To update the site, replace arrays in src/data/products.ts and src/data/content.ts with the JSON above.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
