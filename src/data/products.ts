export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  material: string;
};

export type CartItem = Product & { quantity: number };

export type Collection = {
  slug: string;
  title: string;
  text: string;
  image: string;
  description: string;
};

export const categories = ["All", "Watches", "Fashion", "Accessories", "Sneakers", "Jewelry"];

export const products: Product[] = [
  {
    id: 1,
    name: "Aurum Chronograph",
    category: "Watches",
    price: 1480,
    material: "Brushed titanium, sapphire crystal",
    description: "A precision timepiece with a black ceramic bezel and restrained gold indexing.",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Noir Tailored Coat",
    category: "Fashion",
    price: 920,
    material: "Cashmere wool blend",
    description: "A sculptural outer layer cut for sharp lines, warmth, and quiet presence.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Obsidian Weekender",
    category: "Accessories",
    price: 760,
    material: "Full grain leather, gold hardware",
    description: "A travel essential with architectural structure and hand finished details.",
    image: "https://images.unsplash.com/photo-1590739225284-87f5e794063d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Velour Runner X",
    category: "Sneakers",
    price: 540,
    material: "Italian suede, carbon plate",
    description: "A performance silhouette reimagined with velvet black panels and gold thread.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Solstice Ring",
    category: "Jewelry",
    price: 1180,
    material: "18k vermeil, black onyx",
    description: "A faceted onyx centerpiece held inside a minimal soft gold band.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "Lumen Sunglasses",
    category: "Accessories",
    price: 390,
    material: "Acetate, polarized mineral lenses",
    description: "Low profile eyewear with smoked lenses and discreet gold hinge detailing.",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    name: "Dusk Travel Wallet",
    category: "Accessories",
    price: 280,
    material: "Pebbled leather, silk lining",
    description: "A bi-fold wallet with RFID shielding, gold zip coin pocket, and passport sleeve.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    name: "Orion Chain Bracelet",
    category: "Jewelry",
    price: 640,
    material: "Sterling silver, black rhodium",
    description: "A heavy-link bracelet finished in black rhodium with a matte gold clasp.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 9,
    name: "Carbon Derby",
    category: "Sneakers",
    price: 475,
    material: "Nappa leather, carbon rubber sole",
    description: "A dress-sneaker hybrid designed with sharp toe architecture and cushioned ride.",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=85",
  },
];

export const collections: Collection[] = [
  {
    slug: "midnight-atelier",
    title: "Midnight Atelier",
    text: "Monochrome tailoring and gold hardware for after dark arrivals.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85",
    description: "The Midnight Atelier line explores structure, restraint, and shadow. Expect cashmere overcoats, matte black hardware, and gold stitch detailing across a capsule of evening and travel pieces.",
  },
  {
    slug: "objects-of-light",
    title: "Objects of Light",
    text: "Jewelry, eyewear, and signatures engineered around reflection.",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1600&q=85",
    description: "Objects of Light is a capsule of accessories centered around reflection, mineral tones, and polished surfaces. Each piece captures light differently, creating a living object that changes in motion.",
  },
  {
    slug: "precision-sport",
    title: "Precision Sport",
    text: "Performance sneakers and techwear built with engineering discipline.",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1600&q=85",
    description: "Precision Sport merges speed architecture with luxury materials. Carbon plates, Italian suede, and bonded seams define the collection\u2019s athletic-meets-atelier identity.",
  },
  {
    slug: "quiet-luxury",
    title: "Quiet Luxury",
    text: "Understated essentials for a new era of minimal wealth signaling.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85",
    description: "Quiet Luxury strips away excess. Muted palettes, unbranded silhouettes, and rich tactile materials define a wardrobe built for those who never need to explain their taste.",
  },
];
