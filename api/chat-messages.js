import { sql } from "@vercel/postgres";

const normalizeString = (value) => (typeof value === "string" ? value : "");

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

      const result = sessionId
        ? await sql`
            SELECT id, session_id, name, email, message, sender, status, created_at
            FROM chat_messages
            WHERE session_id = ${sessionId}
            ORDER BY created_at ASC
          `
        : await sql`
            SELECT id, session_id, name, email, message, sender, status, created_at
            FROM chat_messages
            ORDER BY created_at ASC
          `;

      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ ok: true, data: result.rows });
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

      await sql`
        INSERT INTO chat_messages (session_id, name, email, message, sender, status)
        VALUES (${normalizedSessionId}, ${normalizedName}, ${normalizedEmail}, ${normalizedMessage}, ${normalizedSender}, ${status})
      `;

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
