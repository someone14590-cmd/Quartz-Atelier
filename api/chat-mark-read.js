import { getMongoDb } from "./_lib/mongo.js";

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const { sessionId } = req.body || {};
    const normalizedSessionId = normalizeString(sessionId);

    const db = await getMongoDb();
    const collection = db.collection("chat_messages");
    const filter = normalizedSessionId
      ? { sender: "visitor", session_id: normalizedSessionId }
      : { sender: "visitor" };

    await collection.updateMany(filter, { $set: { status: "read" } });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
