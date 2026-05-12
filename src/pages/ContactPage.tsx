import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Icon } from "../components/Icon";
import type { ContactContent } from "../data/content";
import { fetchChatMessages, getChatSessionId, sendChatMessage, subscribeToChatMessages } from "../data/chat";
import type { ChatMessage } from "../data/chat";

export default function ContactPage({ content }: { content: ContactContent }) {
  const sessionId = useMemo(() => getChatSessionId(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const { hero, officeSection, form, inquiryOptions, direct, offices } = content;

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  const refreshMessages = async () => {
    if (!sessionId) return;
    setLoadingMessages(true);
    const data = await fetchChatMessages("visitor", sessionId);
    setMessages(data);
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (!sessionId) return undefined;
    refreshMessages();
    const unsubscribe = subscribeToChatMessages("visitor", refreshMessages, sessionId);
    return () => unsubscribe();
  }, [sessionId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !trimmed) {
      setError("Add your name, email, and message.");
      return;
    }
    if (!sessionId) {
      setError("Chat session unavailable. Refresh and try again.");
      return;
    }
    const ok = await sendChatMessage({
      sessionId,
      name: trimmedName,
      email: trimmedEmail,
      message: trimmed,
      sender: "visitor",
    });
    if (!ok) {
      setError("Message failed to send. Try again.");
      return;
    }
    setDraft("");
    setError("");
    refreshMessages();
  };

  return (
    <main className="min-h-screen bg-black pt-28">
      <section className="section-shell">
        <div className="mb-20 max-w-3xl">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 className="section-title">{hero.title}</h1>
          <p className="mt-6 text-lg leading-8 text-white/58">{hero.lead}</p>
        </div>
      </section>

      <section className="section-shell -mt-10 grid gap-10 lg:grid-cols-[1fr_480px]">
        <div>
          <p className="eyebrow">{officeSection.eyebrow}</p>
          <h2 className="text-4xl font-semibold tracking-[-0.04em] text-white">{officeSection.title}</h2>
          <div className="mt-10 grid gap-5">
            {offices.map((office, i) => (
              <motion.div
                key={office.city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="border border-gold/14 bg-white/[0.025] p-7 backdrop-blur-xl"
              >
                <h3 className="text-xl font-semibold text-white">{office.city}</h3>
                <div className="mt-4 grid gap-2 text-sm text-white/50">
                  <div className="flex items-center gap-3"><Icon name="pin" className="h-4 w-4 text-gold/70" /><span>{office.address}</span></div>
                  <div className="flex items-center gap-3"><Icon name="phone" className="h-4 w-4 text-gold/70" /><span>{office.phone}</span></div>
                  <div className="flex items-center gap-3"><Icon name="clock" className="h-4 w-4 text-gold/70" /><span>{office.hours}</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="h-fit border border-gold/18 bg-white/[0.035] p-7 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl text-white">{form.title}</h2>
              <p className="mt-3 text-sm text-white/45">{form.subtitle}</p>
            </div>
            <div className="rounded-full border border-gold/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gold">
              Online
            </div>
          </div>
          <div className="mt-6 max-h-[320px] space-y-3 overflow-y-auto border border-white/10 bg-black/30 p-4">
            {loadingMessages ? (
              <p className="text-sm text-white/45">Loading chat...</p>
            ) : orderedMessages.length === 0 ? (
              <p className="text-sm text-white/45">Start a conversation with the QUARTZ team.</p>
            ) : (
              orderedMessages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "admin" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[320px] border px-4 py-3 text-sm leading-6 ${message.sender === "admin" ? "border-white/10 bg-white/[0.04] text-white/75" : "border-gold/30 bg-gold/10 text-white"}`}>
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
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="form-input" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" type="email" className="form-input" />
            </div>
            <select className="form-input text-white/60">
              {inquiryOptions.map((option) => (
                <option key={option.value + option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} placeholder="Type your message" className="form-input resize-none" />
            {error && <p className="text-xs text-red-300">{error}</p>}
            <button className="gold-button mt-2" type="submit">Send Message</button>
          </form>
        </motion.div>
      </section>

      <section className="section-shell text-center">
        <p className="eyebrow">{direct.eyebrow}</p>
        <h2 className="section-title mx-auto max-w-2xl">{direct.title}</h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <a href={`mailto:${direct.email}`} className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-7 py-4 text-white/70 transition hover:border-gold hover:text-gold">
            <Icon name="mail" className="h-5 w-5" />
            <span>{direct.email}</span>
          </a>
          <a href={`tel:${direct.phoneHref}`} className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-7 py-4 text-white/70 transition hover:border-gold hover:text-gold">
            <Icon name="phone" className="h-5 w-5" />
            <span>{direct.phoneDisplay}</span>
          </a>
        </div>
      </section>
    </main>
  );
}
