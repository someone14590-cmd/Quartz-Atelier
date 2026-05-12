import { motion } from "framer-motion";
import type { CartItem } from "../data/products";

export default function CheckoutPage({ cart, setCart }: { cart: CartItem[]; setCart: (cart: CartItem[]) => void }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remove = (id: number) => setCart(cart.filter((item) => item.id !== id));
  const update = (id: number, quantity: number) => setCart(cart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));

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
        <form className="h-fit border border-gold/18 bg-white/[0.035] p-6 backdrop-blur-xl" onSubmit={(event) => { event.preventDefault(); alert("Demo checkout complete. Your QUARTZ order is reserved."); setCart([]); }}>
          <h2 className="text-2xl text-white">Order Summary</h2>
          <div className="mt-6 grid gap-3 border-b border-white/10 pb-6 text-white/60">
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Insured shipping</span><span>{subtotal ? "$35" : "$0"}</span></div>
            <div className="flex justify-between text-white"><span>Total</span><span>${(subtotal ? subtotal + 35 : 0).toLocaleString()}</span></div>
          </div>
          <div className="mt-6 grid gap-3">
            <input required placeholder="Full name" className="form-input" />
            <input required placeholder="Email" type="email" className="form-input" />
            <input required placeholder="Shipping address" className="form-input" />
            <button disabled={!subtotal} className="gold-button mt-2 disabled:cursor-not-allowed disabled:opacity-40">Complete Order</button>
          </div>
        </form>
      </section>
    </main>
  );
}
