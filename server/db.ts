import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { computeBlockHash, signData, type LedgerBlock } from './crypto.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'vault.db');
const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      case_id TEXT PRIMARY KEY,
      case_number TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      crime_head TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      station TEXT NOT NULL,
      status TEXT NOT NULL,
      sections_of_law TEXT NOT NULL,
      investigating_officer TEXT NOT NULL,
      io_badge TEXT NOT NULL,
      incident_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      doc_id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      sha256_hash TEXT NOT NULL,
      sha512_hash TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      uploader_role TEXT NOT NULL,
      is_redacted INTEGER DEFAULT 0,
      redacted_content TEXT,
      raw_content TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      FOREIGN KEY (case_id) REFERENCES cases(case_id)
    );

    CREATE TABLE IF NOT EXISTS custody_ledger (
      block_id INTEGER PRIMARY KEY AUTOINCREMENT,
      previous_hash TEXT NOT NULL,
      block_hash TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      doc_id TEXT,
      case_id TEXT,
      details_json TEXT NOT NULL,
      digital_signature TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS certificates (
      cert_id TEXT PRIMARY KEY,
      doc_id TEXT NOT NULL,
      case_id TEXT NOT NULL,
      cert_type TEXT NOT NULL,
      part_a_officer TEXT NOT NULL,
      part_a_designation TEXT NOT NULL,
      part_a_declaration TEXT NOT NULL,
      part_a_signed_at TEXT NOT NULL,
      part_b_expert TEXT NOT NULL,
      part_b_designation TEXT NOT NULL,
      part_b_declaration TEXT NOT NULL,
      part_b_signed_at TEXT NOT NULL,
      hash_value TEXT NOT NULL,
      algorithm TEXT NOT NULL,
      qr_payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (doc_id) REFERENCES documents(doc_id)
    );
  `);
}

export function getCases() {
  const query = db.prepare('SELECT * FROM cases ORDER BY created_at DESC');
  return query.all();
}

export function getCaseById(caseId: string) {
  const query = db.prepare('SELECT * FROM cases WHERE case_id = ?');
  return query.get(caseId);
}

export function getDocuments(caseId?: string) {
  if (caseId) {
    const query = db.prepare('SELECT * FROM documents WHERE case_id = ? ORDER BY created_at ASC');
    return query.all(caseId);
  }
  const query = db.prepare('SELECT * FROM documents ORDER BY created_at DESC');
  return query.all();
}

export function getDocumentById(docId: string) {
  const query = db.prepare('SELECT * FROM documents WHERE doc_id = ?');
  return query.get(docId);
}

export function insertDocument(doc: {
  doc_id: string;
  case_id: string;
  title: string;
  doc_type: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  sha512_hash: string;
  status: string;
  created_at: string;
  created_by: string;
  uploader_role: string;
  raw_content: string;
  metadata_json: string;
}) {
  const stmt = db.prepare(`
    INSERT INTO documents (
      doc_id, case_id, title, doc_type, file_name, file_size, mime_type,
      sha256_hash, sha512_hash, status, created_at, created_by, uploader_role,
      raw_content, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    doc.doc_id,
    doc.case_id,
    doc.title,
    doc.doc_type,
    doc.file_name,
    doc.file_size,
    doc.mime_type,
    doc.sha256_hash,
    doc.sha512_hash,
    doc.status,
    doc.created_at,
    doc.created_by,
    doc.uploader_role,
    doc.raw_content,
    doc.metadata_json
  );
}

export function updateDocumentRedaction(docId: string, redactedContent: string) {
  const stmt = db.prepare('UPDATE documents SET is_redacted = 1, redacted_content = ? WHERE doc_id = ?');
  stmt.run(redactedContent, docId);
}

export function getLedger(): LedgerBlock[] {
  const query = db.prepare('SELECT * FROM custody_ledger ORDER BY block_id ASC');
  return query.all() as unknown as LedgerBlock[];
}

export function appendLedgerEntry(entry: {
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: LedgerBlock['action'];
  doc_id?: string;
  case_id?: string;
  details: Record<string, any>;
}): LedgerBlock {
  const lastBlockQuery = db.prepare('SELECT * FROM custody_ledger ORDER BY block_id DESC LIMIT 1');
  const lastBlock = lastBlockQuery.get() as unknown as LedgerBlock | undefined;

  const blockId = lastBlock ? lastBlock.block_id + 1 : 1;
  const previousHash = lastBlock ? lastBlock.block_hash : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date().toISOString();
  const detailsJson = JSON.stringify(entry.details);

  const blockHash = computeBlockHash(
    blockId,
    previousHash,
    timestamp,
    entry.actor_id,
    entry.actor_name,
    entry.action,
    detailsJson
  );

  const digitalSignature = signData(blockHash);

  const stmt = db.prepare(`
    INSERT INTO custody_ledger (
      block_id, previous_hash, block_hash, timestamp, actor_id, actor_name,
      actor_role, action, doc_id, case_id, details_json, digital_signature
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    blockId,
    previousHash,
    blockHash,
    timestamp,
    entry.actor_id,
    entry.actor_name,
    entry.actor_role,
    entry.action,
    entry.doc_id || null,
    entry.case_id || null,
    detailsJson,
    digitalSignature
  );

  return {
    block_id: blockId,
    previous_hash: previousHash,
    block_hash: blockHash,
    timestamp,
    actor_id: entry.actor_id,
    actor_name: entry.actor_name,
    actor_role: entry.actor_role,
    action: entry.action,
    doc_id: entry.doc_id,
    case_id: entry.case_id,
    details_json: detailsJson,
    digital_signature: digitalSignature
  };
}

export function verifyLedgerIntegrity() {
  const blocks = getLedger();
  if (blocks.length === 0) {
    return { intact: true, blockCount: 0, brokenBlockIndex: null, reason: 'Empty ledger' };
  }

  let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    // 1. Check previous hash continuity
    if (b.previous_hash !== expectedPrevHash) {
      return {
        intact: false,
        blockCount: blocks.length,
        brokenBlockIndex: b.block_id,
        reason: `Hash chaining mismatch at Block #${b.block_id}. Previous hash was modified.`
      };
    }

    // 2. Re-compute block hash
    const recomputed = computeBlockHash(
      b.block_id,
      b.previous_hash,
      b.timestamp,
      b.actor_id,
      b.actor_name,
      b.action,
      b.details_json
    );

    if (recomputed !== b.block_hash) {
      return {
        intact: false,
        blockCount: blocks.length,
        brokenBlockIndex: b.block_id,
        reason: `Cryptographic integrity failure at Block #${b.block_id}. Data payload was tampered.`
      };
    }

    expectedPrevHash = b.block_hash;
  }

  return { intact: true, blockCount: blocks.length, brokenBlockIndex: null, reason: 'Cryptographic chain is unbroken and valid' };
}

export function tamperBlockForDemo(blockId: number, forgedActor: string) {
  const stmt = db.prepare('UPDATE custody_ledger SET actor_name = ? WHERE block_id = ?');
  stmt.run(forgedActor, blockId);
}

export function getCertificates(docId?: string) {
  if (docId) {
    const query = db.prepare('SELECT * FROM certificates WHERE doc_id = ?');
    return query.all();
  }
  const query = db.prepare('SELECT * FROM certificates ORDER BY created_at DESC');
  return query.all();
}

export function insertCertificate(cert: {
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
}) {
  const stmt = db.prepare(`
    INSERT INTO certificates (
      cert_id, doc_id, case_id, cert_type,
      part_a_officer, part_a_designation, part_a_declaration, part_a_signed_at,
      part_b_expert, part_b_designation, part_b_declaration, part_b_signed_at,
      hash_value, algorithm, qr_payload, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    cert.cert_id,
    cert.doc_id,
    cert.case_id,
    cert.cert_type,
    cert.part_a_officer,
    cert.part_a_designation,
    cert.part_a_declaration,
    cert.part_a_signed_at,
    cert.part_b_expert,
    cert.part_b_designation,
    cert.part_b_declaration,
    cert.part_b_signed_at,
    cert.hash_value,
    cert.algorithm,
    cert.qr_payload,
    cert.created_at
  );
}

export { db };
