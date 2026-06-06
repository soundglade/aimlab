import type { NextApiRequest, NextApiResponse } from "next";
import { isWebsiteDeactivated } from "@/lib/deactivation";

type PublicConfigResponse = {
  deactivated: boolean;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<PublicConfigResponse>
) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    deactivated: isWebsiteDeactivated(),
  });
}
