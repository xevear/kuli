import crypto from "crypto";
import { Request } from "express";
import config from "../config";

export default function verifySignature(req: Request) {
  const signatureHeader = req.get("x-hub-signature-256");
  if (!signatureHeader) return false;
  const signature = crypto
    .createHmac("sha256", config.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return `sha256=${signature}` === signatureHeader;
}
