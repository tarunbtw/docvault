import crypto from 'node:crypto';

// Reusable cryptographic key pair for official e-Sign / PKI demonstration
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

export const SYSTEM_PUBLIC_KEY = publicKey;

export function computeSha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function computeSha512(data: string | Buffer): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

export function signData(data: string): string {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, 'hex');
}

export function verifySignature(data: string, signatureHex: string, pubKey: string = publicKey): boolean {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(pubKey, signatureHex, 'hex');
  } catch {
    return false;
  }
}

export interface LedgerBlock {
  block_id: number;
  previous_hash: string;
  block_hash: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: 'INGEST' | 'VIEW' | 'REDACT' | 'SIGN' | 'EXPORT' | 'VERIFY' | 'TRANSFER' | 'TAMPER_TEST';
  doc_id?: string;
  case_id?: string;
  details_json: string;
  digital_signature: string;
}

export function computeBlockHash(
  blockId: number,
  previousHash: string,
  timestamp: string,
  actorId: string,
  actorName: string,
  action: string,
  detailsJson: string
): string {
  const payload = `${blockId}|${previousHash}|${timestamp}|${actorId}|${actorName}|${action}|${detailsJson}`;
  return computeSha256(payload);
}
