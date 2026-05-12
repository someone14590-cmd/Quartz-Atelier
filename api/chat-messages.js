import { getMongoDb } from "./_lib/mongo.js";

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const formatMessage = (doc) => {
  const createdAt = doc.created_at instanceof Date ? doc.created_at.toISOString() : doc.created_at;
  return {
    id: doc._id?.toString?.() ?? "",
    session_id: doc.session_id ?? "",
    name: doc.name ?? "",
    email: doc.email ?? "",
    message: doc.message ?? "",
    sender: doc.sender ?? "visitor",
    status: doc.status ?? "new",
    created_at: createdAt ?? new Date().toISOString(),
  };
};

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const mode = normalizeString(req.query?.mode) || "admin";
      const sessionId = normalizeString(req.query?.sessionId);

      if (mode !== "visitor" && mode !== "admin") {
        res.status(400).json({ ok: false, error: "Invalid mode." });
        return;
      }

      if (mode === "visitor" && !sessionId) {
        res.status(400).json({ ok: false, error: "Session ID required." });
        return;
      }

      const db = await getMongoDb();
      const collection = db.collection("chat_messages");
      const filter = sessionId ? { session_id: sessionId } : {};
      const docs = await collection.find(filter).sort({ created_at: 1 }).toArray();
      const data = docs.map(formatMessage);

      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ ok: true, data });
      return;
    }

    if (req.method === "POST") {
      const { sessionId, name, email, message, sender } = req.body || {};
      const normalizedSessionId = normalizeString(sessionId);
      const normalizedMessage = normalizeString(message);
      const normalizedSender = normalizeString(sender);

      if (!normalizedSessionId || !normalizedMessage) {
        res.status(400).json({ ok: false, error: "Session ID and message are required." });
        return;
      }

      if (normalizedSender !== "visitor" && normalizedSender !== "admin") {
        res.status(400).json({ ok: false, error: "Invalid sender." });
        return;
      }

      const status = normalizedSender === "visitor" ? "new" : "read";
      const normalizedName = normalizeString(name);
      const normalizedEmail = normalizeString(email);

      const db = await getMongoDb();
      const collection = db.collection("chat_messages");
      await collection.insertOne({
        session_id: normalizedSessionId,
        name: normalizedName,
        email: normalizedEmail,
        message: normalizedMessage,
        sender: normalizedSender,
        status,
        created_at: new Date(),
      });

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
