export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    res.status(500).json({ ok: false, message: "ADMIN_PASSWORD not set" });
    return;
  }

  if (password && password === expected) {
    res.status(200).json({ ok: true });
    return;
  }

  res.status(401).json({ ok: false });
}
