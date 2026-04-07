/**
 * Media upload endpoint for Magic Moments
 * Handles video/audio files and stores them in S3
 */

import { storagePut } from "./storage";
import { createHmac } from "crypto";
import { ENV } from "./_core/env";

export interface UploadMetadata {
  userId: number;
  type: "video" | "audio";
  latitude: number;
  longitude: number;
  timestamp: string;
  mimeType: string;
}

/**
 * Generate cryptographic signature for proof-of-capture
 */
export function generateSignature(metadata: UploadMetadata): string {
  const signatureData = JSON.stringify({
    userId: metadata.userId,
    latitude: metadata.latitude,
    longitude: metadata.longitude,
    timestamp: metadata.timestamp,
    type: metadata.type,
  });

  const signature = createHmac("sha256", ENV.cookieSecret || "default-secret")
    .update(signatureData)
    .digest("hex");

  return signature;
}

/**
 * Upload media file to S3 and return CDN URL
 */
export async function uploadMediaToS3(
  blob: Uint8Array,
  metadata: UploadMetadata
): Promise<{ url: string; signature: string; key: string }> {
  try {
    // Generate unique key based on user and timestamp
    const timestamp = new Date(metadata.timestamp).getTime();
    const fileExtension = metadata.type === "video" ? "webm" : "webm";
    const key = `magic-moments/${metadata.userId}/${timestamp}.${fileExtension}`;

    // Upload to S3
    const { url } = await storagePut(key, blob, metadata.mimeType);

    // Generate cryptographic signature
    const signature = generateSignature(metadata);

    return { url, signature, key };
  } catch (error) {
    console.error("Media upload failed:", error);
    throw new Error(`Failed to upload media: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Verify signature for proof-of-capture
 */
export function verifySignature(metadata: UploadMetadata, signature: string): boolean {
  const expectedSignature = generateSignature(metadata);
  return signature === expectedSignature;
}
