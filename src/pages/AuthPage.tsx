export default function AuthPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 pt-28">
      <section className="w-full max-w-4xl border border-gold/16 bg-white/[0.035] p-6 backdrop-blur-2xl md:p-10">
        <p className="eyebrow">Member Access</p>
        <h1 className="section-title">Enter the private client portal.</h1>
        <p className="mt-4 text-white/50">Create a QUARTZ account to track orders, save favorites, and unlock private collection drops.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-2xl text-white">Sign In</h2>
            <input className="form-input" placeholder="Email" type="email" />
            <input className="form-input" placeholder="Password" type="password" />
            <button className="gold-button" type="submit">Sign In</button>
          </form>
          <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-2xl text-white">Create Account</h2>
            <input className="form-input" placeholder="Name" />
            <input className="form-input" placeholder="Email" type="email" />
            <input className="form-input" placeholder="Password" type="password" />
            <button className="ghost-button" type="submit">Create Profile</button>
          </form>
        </div>
      </section>
    </main>
  );
}
