import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const MEMBER_AUTH_KEY = "quartz_member_authed";
  const MEMBER_PROFILE_KEY = "quartz_member_profile";
  const MEMBER_EVENT = "quartz:member-auth";

  const storeMemberSession = (profile: { name?: string; email: string }) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(MEMBER_AUTH_KEY, "true");
    localStorage.setItem(MEMBER_PROFILE_KEY, JSON.stringify({ name: profile.name ?? "", email: profile.email }));
    window.dispatchEvent(new Event(MEMBER_EVENT));
  };

  const submitSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setSignInError("");

    const trimmedEmail = signInEmail.trim().toLowerCase();
    const trimmedPassword = signInPassword.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setSignInError("Add your email and password.");
      return;
    }

    try {
      setSigningIn(true);
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; profile?: { name?: string; email: string } } | null;

      if (!response.ok || !payload?.ok || !payload.profile) {
        setSignInError(payload?.error ?? "Sign in failed.");
        return;
      }

      storeMemberSession(payload.profile);
      setSignInEmail("");
      setSignInPassword("");
      navigate("/", { replace: true });
    } catch {
      setSignInError("Sign in failed.");
    } finally {
      setSigningIn(false);
    }
  };

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault();
    setCreateError("");

    const trimmedName = createName.trim();
    const trimmedEmail = createEmail.trim().toLowerCase();
    const trimmedPassword = createPassword.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setCreateError("Add your name, email, and password.");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: trimmedPassword }),
      });
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; profile?: { name?: string; email: string } } | null;

      if (!response.ok || !payload?.ok) {
        setCreateError(payload?.error ?? "Profile creation failed.");
        return;
      }

      storeMemberSession(payload?.profile ?? { name: trimmedName, email: trimmedEmail });
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      navigate("/", { replace: true });
    } catch {
      setCreateError("Profile creation failed.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 pt-28">
      <section className="w-full max-w-4xl border border-gold/16 bg-white/[0.035] p-6 backdrop-blur-2xl md:p-10">
        <p className="eyebrow">Member Access</p>
        <h1 className="section-title">Enter the private client portal.</h1>
        <p className="mt-4 text-white/50">Create a QUARTZ account to track orders, save favorites, and unlock private collection drops.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <form className="grid gap-4" onSubmit={submitSignIn}>
            <h2 className="text-2xl text-white">Sign In</h2>
            <input className="form-input" placeholder="Email" type="email" value={signInEmail} onChange={(event) => setSignInEmail(event.target.value)} />
            <input className="form-input" placeholder="Password" type="password" value={signInPassword} onChange={(event) => setSignInPassword(event.target.value)} />
            {signInError && <p className="text-xs text-red-300">{signInError}</p>}
            <button className="gold-button" type="submit" disabled={signingIn}>{signingIn ? "Signing In..." : "Sign In"}</button>
          </form>
          <form className="grid gap-4" onSubmit={submitCreate}>
            <h2 className="text-2xl text-white">Create Account</h2>
            <input className="form-input" placeholder="Name" value={createName} onChange={(event) => setCreateName(event.target.value)} />
            <input className="form-input" placeholder="Email" type="email" value={createEmail} onChange={(event) => setCreateEmail(event.target.value)} />
            <input className="form-input" placeholder="Password" type="password" value={createPassword} onChange={(event) => setCreatePassword(event.target.value)} />
            {createError && <p className="text-xs text-red-300">{createError}</p>}
            <button className="ghost-button" type="submit" disabled={creating}>{creating ? "Creating..." : "Create Profile"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
