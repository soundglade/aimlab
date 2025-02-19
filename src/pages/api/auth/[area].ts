import { NextApiRequest, NextApiResponse } from "next";
import {
  isValidPassword,
  signToken,
  getCookieName,
  COOKIE_OPTIONS,
} from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { area } = req.query;
  const { password } = req.body;

  if (typeof area !== "string" || (area !== "admin" && area !== "playground")) {
    return res.status(400).json({ error: "Invalid area" });
  }

  if (typeof password !== "string" || !password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (!isValidPassword(area, password)) {
    return res.status(401).json({ error: "Invalid password" });
  }

  try {
    const token = await signToken({ area: area as "admin" | "playground" });
    res.setHeader(
      "Set-Cookie",
      `${getCookieName(
        area as "admin" | "playground"
      )}=${token}; ${Object.entries(COOKIE_OPTIONS)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
