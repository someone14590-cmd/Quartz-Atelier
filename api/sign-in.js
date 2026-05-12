import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getMongoDb } from "./_lib/mongo.js";

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");
const isValidEmail = (value) => /.+@.+\..+/.test(value);
const isSha256Hash = (value) => /^[a-f0-9]{64}$/i.test(value);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeString(email).toLowerCase();
    const normalizedPassword = normalizeString(password);

    if (!normalizedEmail || !normalizedPassword) {
      res.status(400).json({ ok: false, error: "Email and password are required." });
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({ ok: false, error: "Enter a valid email address." });
      return;
    }

    const db = await getMongoDb();
    const collection = db.collection("profiles");
    const profile = await collection.findOne({ email: normalizedEmail });

    if (!profile) {
      res.status(401).json({ ok: false, error: "Invalid email or password." });
      return;
    }

    const storedHash = typeof profile.password_hash === "string" ? profile.password_hash : "";
    let matches = false;

    if (storedHash) {
      if (storedHash.startsWith("$2")) {
        matches = await bcrypt.compare(normalizedPassword, storedHash);
      } else if (isSha256Hash(storedHash)) {
        const legacyHash = crypto.createHash("sha256").update(normalizedPassword).digest("hex");
        matches = legacyHash === storedHash;
        if (matches) {
          const upgradedHash = await bcrypt.hash(normalizedPassword, 12);
          await collection.updateOne({ _id: profile._id }, { $set: { password_hash: upgradedHash } });
        }
      }
    }

    if (!matches) {
      res.status(401).json({ ok: false, error: "Invalid email or password." });
      return;
    }

    res.status(200).json({ ok: true, profile: { name: profile.name ?? "", email: profile.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Server error." });
  }
}
