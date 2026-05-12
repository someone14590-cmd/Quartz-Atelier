import bcrypt from "bcryptjs";
import { getMongoDb } from "./_lib/mongo.js";

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");
const isValidEmail = (value) => /.+@.+\..+/.test(value);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const { name, email, password } = req.body || {};
    const normalizedName = normalizeString(name);
    const normalizedEmail = normalizeString(email).toLowerCase();
    const normalizedPassword = normalizeString(password);

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      res.status(400).json({ ok: false, error: "Name, email, and password are required." });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ ok: false, error: "Enter a valid email address." });
      return;
    }

    const db = await getMongoDb();
    const collection = db.collection("profiles");

    const existing = await collection.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ ok: false, error: "Email already registered." });
      return;
    }

    const passwordHash = await bcrypt.hash(normalizedPassword, 12);

    await collection.insertOne({
      name: normalizedName,
      email: normalizedEmail,
      password_hash: passwordHash,
      created_at: new Date(),
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
