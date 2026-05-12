import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { QuartzLogo } from "./components/QuartzLogo";
import type { CartItem, Collection, Product } from "./data/products";
import type { AboutContent, ContactContent } from "./data/content";
import { loadAboutContent, loadCollections, loadContactContent, loadProducts, STOREFRONT_UPDATE_EVENT } from "./data/storefront";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CollectionsPage from "./pages/CollectionsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import OrdersPage from "./pages/OrdersPage";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => loadProducts());
  const [catalogCollections, setCatalogCollections] = useState<Collection[]>(() => loadCollections());
  const [aboutData, setAboutData] = useState<AboutContent>(() => loadAboutContent());
  const [contactData, setContactData] = useState<ContactContent>(() => loadContactContent());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        ".section-shell",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [location.pathname, loading]);

  useEffect(() => {
    const refresh = () => {
      setCatalogProducts(loadProducts());
      setCatalogCollections(loadCollections());
      setAboutData(loadAboutContent());
      setContactData(loadContactContent());
    };
    window.addEventListener("storage", refresh);
    window.addEventListener(STOREFRONT_UPDATE_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(STOREFRONT_UPDATE_EVENT, refresh);
    };
  }, []);

  useEffect(() => {
    setCatalogProducts(loadProducts());
    setCatalogCollections(loadCollections());
    setAboutData(loadAboutContent());
    setContactData(loadContactContent());
  }, [location.pathname]);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const toggleWishlist = (id: number) =>
    setWishlist((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

  const shared = { addToCart, toggleWishlist, wishlist, products: catalogProducts };

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-gold selection:text-black">
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-black"
          >
            <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7 }} className="text-center">
              <QuartzLogo />
              <div className="mt-8 h-px w-64 overflow-hidden bg-white/10">
                <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} className="h-full w-1/2 bg-gold" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAdmin && (
        <Navbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} wishlistCount={wishlist.length} />
      )}

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
          <Routes location={location}>
            <Route path="/" element={<HomePage {...shared} collections={catalogCollections} />} />
            <Route path="/shop" element={<ShopPage {...shared} />} />
            <Route path="/collections" element={<CollectionsPage collections={catalogCollections} />} />
            <Route path="/about" element={<AboutPage content={aboutData} />} />
            <Route path="/contact" element={<ContactPage content={contactData} />} />
            <Route path="/product/:productId" element={<ProductPage {...shared} />} />
            <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {!isAdmin && <Footer />}
    </div>
  );
}
