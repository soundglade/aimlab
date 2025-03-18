import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const FEEDBACK_FILE_PATH = path.join(
  process.cwd(),
  "public/storage/feedback.json"
);

type Feedback = {
  message: string;
  contact?: string;
  timestamp: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const { message, contact } = req.body;

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Feedback message is required" });
    }

    const newFeedback: Feedback = {
      message,
      timestamp: new Date().toISOString(),
    };

    if (contact && typeof contact === "string") {
      newFeedback.contact = contact;
    }

    let feedbackList: Feedback[] = [];

    try {
      if (fs.existsSync(FEEDBACK_FILE_PATH)) {
        const fileContent = fs.readFileSync(FEEDBACK_FILE_PATH, "utf-8");
        feedbackList = JSON.parse(fileContent);
      }
    } catch (error) {
      feedbackList = [];
    }

    feedbackList.push(newFeedback);

    const dir = path.dirname(FEEDBACK_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(FEEDBACK_FILE_PATH, JSON.stringify(feedbackList, null, 2));

    return res
      .status(200)
      .json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to save feedback" });
  }
}
