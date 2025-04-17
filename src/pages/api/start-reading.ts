import { NextApiRequest, NextApiResponse } from "next";
import { Socket } from "net";

interface ExtendedSocket extends Socket {
  server?: {
    res?: NextApiResponse & {
      flush?: () => void;
    };
  };
}

interface ExtendedResponse extends NextApiResponse {
  flush?: () => void;
}

export default async function handler(
  req: NextApiRequest,
  res: ExtendedResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Disable response buffering
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Access the raw response object to manually flush
  const socket = res.socket as ExtendedSocket;
  const rawRes = socket?.server?.res || res;
  const flush = () => {
    if (typeof rawRes.flush === "function") {
      rawRes.flush();
    }
  };

  // Send 5 dummy responses, one per second
  for (let i = 1; i <= 5; i++) {
    res.write(`data: ${JSON.stringify({ message: `Dummy message ${i}` })}\n\n`);
    flush();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};
