import { sql } from "@vercel/postgres";

const normalizeString = (value) => (typeof value === "string" ? value : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const { sessionId } = req.body || {};
    const normalizedSessionId = normalizeString(sessionId);

    if (normalizedSessionId) {
      await sql`
        UPDATE chat_messages
        SET status = 'read'
        WHERE sender = 'visitor' AND session_id = ${normalizedSessionId}
      `;
    } else {
      await sql`
        UPDATE chat_messages
        SET status = 'read'
        WHERE sender = 'visitor'
      `;
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
