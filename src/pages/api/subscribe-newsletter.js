export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Valid email is required" });
  }

  try {
    const ghostRes = await fetch(
      "https://newsletter.meditationlab.ai/members/api/send-magic-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const rawText = await ghostRes.text();
    let data = null;
    if (ghostRes.ok) {
      // Success: Ghost returned 201 and probably just a text message
      return res.status(200).json({ status: "OK" });
    } else {
      // Try to parse error details as JSON, if possible
      try {
        data = JSON.parse(rawText);
      } catch (jsonErr) {
        // Log and fall back to raw text
        console.error("Failed to parse Ghost error response as JSON:", jsonErr);
        console.error("Ghost response body (raw text):", rawText);
      }
      console.error("Ghost API error:", {
        status: ghostRes.status,
        headers: Object.fromEntries(ghostRes.headers.entries()),
        body: data || rawText,
      });
      return res
        .status(ghostRes.status)
        .json({ error: data?.errors || rawText || "Signup failed" });
    }
  } catch (err) {
    console.error("subscribe-newsletter error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
