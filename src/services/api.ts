export interface Case {
  case_id: string;
  case_number: string;
  title: string;
  crime_head: string;
  jurisdiction: string;
  station: string;
  status: 'UNDER_INVESTIGATION' | 'CHARGE_SHEETED' | 'EVIDENCE_COLLECTION' | 'DISPOSED';
  sections_of_law: string;
  investigating_officer: string;
  io_badge: string;
  incident_date: string;
  created_at: string;
  documents?: DocumentItem[];
  documents_count?: number;
}

export interface DocumentItem {
  doc_id: string;
  case_id: string;
  title: string;
  doc_type: 'FIR' | 'CASE_DIARY' | 'WITNESS_STATEMENT' | 'SEIZURE_MEMO' | 'FSL_REPORT' | 'CHARGE_SHEET' | 'COURT_ORDER' | 'CASE_RECORD';
  file_name: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  sha512_hash: string;
  status: string;
  created_at: string;
  created_by: string;
  uploader_role: string;
  is_redacted: number;
  redacted_content?: string;
  raw_content: string;
  metadata_json: string;
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

export interface Certificate {
  cert_id: string;
  doc_id: string;
  case_id: string;
  cert_type: string;
  part_a_officer: string;
  part_a_designation: string;
  part_a_declaration: string;
  part_a_signed_at: string;
  part_b_expert: string;
  part_b_designation: string;
  part_b_declaration: string;
  part_b_signed_at: string;
  hash_value: string;
  algorithm: string;
  qr_payload: string;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  system: string;
  jurisdiction: string;
  ledger_status: string;
  ledger_details: {
    intact: boolean;
    blockCount: number;
    brokenBlockIndex: number | null;
    reason: string;
  };
  public_key: string;
}

export interface VerificationResult {
  verified: boolean;
  verdict: string;
  confidence?: string;
  hash_verified: string;
  algorithm?: string;
  message?: string;
  document?: Partial<DocumentItem>;
  case_details?: Case;
  bsa_certificate?: Certificate;
  ledger_history_count?: number;
  ledger_overall_intact?: boolean;
}

const BASE_URL = '/api';

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${BASE_URL}/health`);
  return res.json();
}

export async function getCases(): Promise<Case[]> {
  const res = await fetch(`${BASE_URL}/cases`);
  return res.json();
}

export async function getCaseById(caseId: string): Promise<Case> {
  const res = await fetch(`${BASE_URL}/cases/${caseId}`);
  return res.json();
}

export async function createCase(payload: Partial<Case>): Promise<Case> {
  const res = await fetch(`${BASE_URL}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getDocuments(caseId?: string): Promise<DocumentItem[]> {
  const url = caseId ? `${BASE_URL}/documents?case_id=${caseId}` : `${BASE_URL}/documents`;
  const res = await fetch(url);
  return res.json();
}

export async function getDocumentById(docId: string): Promise<DocumentItem> {
  const res = await fetch(`${BASE_URL}/documents/${docId}`);
  return res.json();
}

export async function uploadDocument(payload: {
  case_id: string;
  title: string;
  doc_type: string;
  file_name?: string;
  content: string;
  created_by?: string;
  uploader_role?: string;
  uploader_id?: string;
  metadata?: any;
}): Promise<{ document: DocumentItem; ledger_block: LedgerBlock }> {
  const res = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function logDocumentView(docId: string, actor: { name: string; role: string; id: string }): Promise<any> {
  const res = await fetch(`${BASE_URL}/documents/${docId}/log-view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actor_name: actor.name,
      actor_role: actor.role,
      actor_id: actor.id,
    }),
  });
  return res.json();
}

export async function redactDocument(docId: string, redactedContent: string, reason: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/documents/${docId}/redact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      redacted_content: redactedContent,
      reason,
    }),
  });
  return res.json();
}

export async function getLedger(): Promise<LedgerBlock[]> {
  const res = await fetch(`${BASE_URL}/ledger`);
  return res.json();
}

export async function verifyLedger(): Promise<HealthStatus['ledger_details']> {
  const res = await fetch(`${BASE_URL}/ledger/verify`);
  return res.json();
}

export async function simulateTamper(blockId?: number): Promise<any> {
  const res = await fetch(`${BASE_URL}/ledger/simulate-tamper`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ block_id: blockId }),
  });
  return res.json();
}

export async function resetDatabase(): Promise<any> {
  const res = await fetch(`${BASE_URL}/ledger/reset`, {
    method: 'POST',
  });
  return res.json();
}

export async function getCertificates(docId?: string): Promise<Certificate[]> {
  const url = docId ? `${BASE_URL}/certificates?doc_id=${docId}` : `${BASE_URL}/certificates`;
  const res = await fetch(url);
  return res.json();
}

export async function generateCertificate(payload: {
  doc_id: string;
  part_a_officer: string;
  part_a_designation?: string;
  part_a_declaration?: string;
  part_b_expert: string;
  part_b_designation?: string;
  part_b_declaration?: string;
}): Promise<Certificate> {
  const res = await fetch(`${BASE_URL}/certificates/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function verifyHashOrContent(hashOrContent: { hash?: string; content?: string }): Promise<VerificationResult> {
  const res = await fetch(`${BASE_URL}/verify/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(hashOrContent),
  });
  return res.json();
}
