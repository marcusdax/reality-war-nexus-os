import { createHmac } from "crypto";

const CRYPTO_SECRET = process.env.JWT_SECRET || "default-secret-key";

/**
 * Generate a cryptographic signature for Magic Moments and transactions.
 * This creates a deterministic hash that can be verified later.
 */
export function generateSignature(data: Record<string, any>): string {
  const dataString = JSON.stringify(data);
  const signature = createHmac("sha256", CRYPTO_SECRET).update(dataString).digest("hex");
  return signature;
}

/**
 * Verify a cryptographic signature.
 */
export function verifySignature(data: Record<string, any>, signature: string): boolean {
  const expectedSignature = generateSignature(data);
  return expectedSignature === signature;
}

/**
 * Create a cryptographic chain link for immutable ledger.
 * Each entry references the previous one, creating an unbreakable chain.
 */
export function createChainLink(
  previousHash: string,
  data: Record<string, any>
): { hash: string; chainedData: string } {
  const chainedData = JSON.stringify({
    previousHash,
    data,
    timestamp: new Date().getTime(),
  });

  const hash = createHmac("sha256", CRYPTO_SECRET).update(chainedData).digest("hex");

  return { hash, chainedData };
}

/**
 * Verify a chain link in the immutable ledger.
 */
export function verifyChainLink(
  previousHash: string,
  chainedData: string,
  expectedHash: string
): boolean {
  const hash = createHmac("sha256", CRYPTO_SECRET).update(chainedData).digest("hex");
  return hash === expectedHash && JSON.parse(chainedData).previousHash === previousHash;
}

/**
 * Generate a timestamp-based proof of work for Magic Moments.
 * This proves that the verification happened at a specific time.
 */
export function generateTimestampProof(
  userId: number,
  latitude: number,
  longitude: number,
  timestamp: number
): string {
  const proof = createHmac("sha256", CRYPTO_SECRET)
    .update(`${userId}:${latitude}:${longitude}:${timestamp}`)
    .digest("hex");

  return proof;
}

/**
 * Generate a geolocation proof for spatial verification.
 * Ensures that the user was actually at the claimed location.
 */
export function generateGeolocationProof(
  userId: number,
  latitude: number,
  longitude: number,
  accuracy: number
): string {
  const proof = createHmac("sha256", CRYPTO_SECRET)
    .update(`${userId}:${latitude.toFixed(8)}:${longitude.toFixed(8)}:${accuracy}`)
    .digest("hex");

  return proof;
}
