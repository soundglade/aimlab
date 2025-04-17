import { NextApiRequest, NextApiResponse } from "next";
import { Socket } from "net";
import { formatMeditationScript } from "@/lib/meditation-formatter";
import { jsonrepair } from "jsonrepair";

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

function tryRepairAndParseJSON(text: string) {
  try {
    // Remove anything before the first '{' (since the output is a JSON object)
    const jsonStart = text.indexOf("{");
    if (jsonStart === -1) return null;
    const cleanedOutput = text.slice(jsonStart);
    // Clean up ending backticks if present
    const finalOutput = cleanedOutput.replace(/\]\s*[`]+$/, "]");

    const repairedJson = jsonrepair(finalOutput);
    return JSON.parse(repairedJson);
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: ExtendedResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { script } = req.body;
  if (!script || typeof script !== "string") {
    return res
      .status(400)
      .json({ error: "Script is required and must be a string" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const socket = res.socket as ExtendedSocket;
  const rawRes = socket?.server?.res || res;
  const flush = () => {
    if (typeof rawRes.flush === "function") {
      rawRes.flush();
    }
  };

  let accumulated = "";

  try {
    await formatMeditationScript(script, {
      stream: true,
      onToken: (token) => {
        accumulated += token;
        const parsed = tryRepairAndParseJSON(accumulated);
        if (parsed) {
          res.write(`data: ${JSON.stringify(parsed)}\n\n`);
          flush();
        }
      },
    });
    res.end();
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      })}\n\n`
    );
    flush();
    res.end();
  }
}

export const config = {
  api: {
    bodyParser: true,
    responseLimit: false,
  },
};
