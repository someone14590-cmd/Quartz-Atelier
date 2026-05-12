import { aboutContent, contactContent } from "./content";
import { collections, products } from "./products";
import type { AboutContent, ContactContent } from "./content";
import type { Collection, Product } from "./products";

export const STORAGE_KEYS = {
  products: "quartz_admin_products",
  collections: "quartz_admin_collections",
  about: "quartz_admin_about",
  contact: "quartz_admin_contact",
  orders: "quartz_admin_orders",
};

export const STOREFRONT_UPDATE_EVENT = "quartz:storefront-update";

export const emitStorefrontUpdate = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STOREFRONT_UPDATE_EVENT));
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readLocal = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const cloneProducts = (items: Product[]) => items.map((item) => ({ ...item }));
const cloneCollections = (items: Collection[]) => items.map((item) => ({ ...item }));
const cloneContent = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const loadProducts = (): Product[] => cloneProducts(readLocal(STORAGE_KEYS.products, products));

export const loadCollections = (): Collection[] => cloneCollections(readLocal(STORAGE_KEYS.collections, collections));

export const loadAboutContent = (): AboutContent => cloneContent(readLocal(STORAGE_KEYS.about, aboutContent));

export const loadContactContent = (): ContactContent => cloneContent(readLocal(STORAGE_KEYS.contact, contactContent));
