import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { seedDatabase } from './seed.ts';
import {
  getCases,
  getCaseById,
  getDocuments,
  getDocumentById,
  insertDocument,
  updateDocumentRedaction,
  getLedger,
  appendLedgerEntry,
  verifyLedgerIntegrity,
  tamperBlockForDemo,
  getCertificates,
  insertCertificate,
  db
} from './db.ts';
import { computeSha256, computeSha512, SYSTEM_PUBLIC_KEY } from './crypto.ts';

const fastify = Fastify({
  logger: false
});

// Register plugins
await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

await fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  await fastify.register(fastifyStatic, {
    root: distPath,
    prefix: '/',
  });
  fastify.setNotFoundHandler((req, reply) => {
    if (req.raw.url && req.raw.url.startsWith('/api')) {
      return reply.status(404).send({ error: 'Endpoint not found' });
    }
    return reply.sendFile('index.html');
  });
}

// Initialize and seed database
seedDatabase();

// 1. Health & System Status
fastify.get('/api/health', async () => {
  const integrity = verifyLedgerIntegrity();
  return {
    status: 'ONLINE',
    system: 'LEXIS-VAULT Digital Evidence & Document Management System',
    jurisdiction: 'Government of India / BSA 2023 Compliant',
    ledger_status: integrity.intact ? 'SECURE_AND_VERIFIED' : 'TAMPER_DETECTED',
    ledger_details: integrity,
    public_key: SYSTEM_PUBLIC_KEY
  };
});

// 2. Cases APIs
fastify.get('/api/cases', async () => {
  return getCases();
});

fastify.get('/api/cases/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const caseData = getCaseById(id);
  if (!caseData) {
    return reply.status(404).send({ error: 'Case not found' });
  }
  const documents = getDocuments(id);
  return { ...caseData, documents };
});

fastify.post('/api/cases', async (req, reply) => {
  const body = req.body as any;
  if (!body.title || !body.case_number) {
    return reply.status(400).send({ error: 'Title and case_number are required' });
  }

  const caseId = `CASE-2024-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO cases (
      case_id, case_number, title, crime_head, jurisdiction, station, status,
      sections_of_law, investigating_officer, io_badge, incident_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    caseId,
    body.case_number,
    body.title,
    body.crime_head || 'General Investigation',
    body.jurisdiction || 'State Police Department',
    body.station || 'District Headquarters PS',
    'UNDER_INVESTIGATION',
    body.sections_of_law || 'Section 173 BNSS',
    body.investigating_officer || 'Inspector In-Charge',
    body.io_badge || 'POL-8842',
    body.incident_date || now,
    now
  );

  appendLedgerEntry({
    actor_id: body.io_badge || 'POL-8842',
    actor_name: body.investigating_officer || 'Inspector In-Charge',
    actor_role: 'Investigating Officer',
    action: 'INGEST',
    case_id: caseId,
    details: {
      action: 'Case Docket Registered',
      case_number: body.case_number,
      title: body.title
    }
  });

  return getCaseById(caseId);
});

// 3. Documents APIs
fastify.get('/api/documents', async (req) => {
  const { case_id } = req.query as { case_id?: string };
  return getDocuments(case_id);
});

fastify.get('/api/documents/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const doc = getDocumentById(id);
  if (!doc) {
    return reply.status(404).send({ error: 'Document not found' });
  }
  return doc;
});

// Ingest / Upload Document
fastify.post('/api/documents/upload', async (req, reply) => {
  const body = req.body as any;
  const content = body.content || 'Standard Police Department Recorded Statement / Exhibit';
  const sha256 = computeSha256(content);
  const sha512 = computeSha512(content);
  const docId = `DOC-2024-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const docData = {
    doc_id: docId,
    case_id: body.case_id || 'CASE-2024-ND-0142',
    title: body.title || 'Investigation Record',
    doc_type: body.doc_type || 'CASE_RECORD',
    file_name: body.file_name || `${docId}.pdf`,
    file_size: Buffer.byteLength(content, 'utf8'),
    mime_type: 'application/pdf',
    sha256_hash: sha256,
    sha512_hash: sha512,
    status: 'VERIFIED_ORIGINAL',
    created_at: now,
    created_by: body.created_by || 'Officer In-Charge',
    uploader_role: body.uploader_role || 'Investigating Officer',
    raw_content: content,
    metadata_json: JSON.stringify(body.metadata || {})
  };

  insertDocument(docData);

  // Ingest block in ledger
  const block = appendLedgerEntry({
    actor_id: body.uploader_id || 'IO-AUTH-109',
    actor_name: docData.created_by,
    actor_role: docData.uploader_role,
    action: 'INGEST',
    doc_id: docId,
    case_id: docData.case_id,
    details: {
      document_title: docData.title,
      doc_type: docData.doc_type,
      file_name: docData.file_name,
      sha256: sha256,
      sha512: sha512,
      ingestion_mode: 'WORM Encrypted Vault Deposit'
    }
  });

  return {
    document: docData,
    ledger_block: block
  };
});

// View Logging (Forensic Chain of Custody)
fastify.post('/api/documents/:id/log-view', async (req, reply) => {
  const { id } = req.params as { id: string };
  const doc = getDocumentById(id) as any;
  if (!doc) {
    return reply.status(404).send({ error: 'Document not found' });
  }

  const body = (req.body as any) || {};
  const block = appendLedgerEntry({
    actor_id: body.actor_id || 'OFFICER-SESSION',
    actor_name: body.actor_name || 'Inspector on Duty',
    actor_role: body.actor_role || 'Investigating Officer',
    action: 'VIEW',
    doc_id: id,
    case_id: doc.case_id,
    details: {
      action: 'Document Decrypted & Rendered on Forensic Display',
      watermark_applied: true,
      ip_address: req.ip || '10.42.18.9',
      user_agent: req.headers['user-agent'] || 'LEXIS-SECURE-TERMINAL'
    }
  });

  return { success: true, block };
});

// Redact Document
fastify.post('/api/documents/:id/redact', async (req, reply) => {
  const { id } = req.params as { id: string };
  const doc = getDocumentById(id) as any;
  if (!doc) {
    return reply.status(404).send({ error: 'Document not found' });
  }

  const body = (req.body as any) || {};
  const redactedContent = body.redacted_content || doc.raw_content;

  updateDocumentRedaction(id, redactedContent);

  const block = appendLedgerEntry({
    actor_id: body.actor_id || 'IO-DL-44821',
    actor_name: body.actor_name || 'Inspector Vikramaditya Sharma',
    actor_role: 'Investigating Officer',
    action: 'REDACT',
    doc_id: id,
    case_id: doc.case_id,
    details: {
      reason: body.reason || 'Automated PII / POCSO masking pursuant to statutory requirements',
      statutory_compliance: 'Section 228A IPC / Section 74 Juvenile Justice Act / DPDP 2023',
      mask_applied_at: new Date().toISOString()
    }
  });

  return { success: true, block };
});

// 4. Ledger & Merkle Chain APIs
fastify.get('/api/ledger', async () => {
  return getLedger();
});

fastify.get('/api/ledger/verify', async () => {
  return verifyLedgerIntegrity();
});

// Demo: Tamper with a block to demonstrate detection
fastify.post('/api/ledger/simulate-tamper', async (req) => {
  const body = (req.body as any) || {};
  const blockId = body.block_id || 2;
  const forgedActor = body.forged_actor || 'UNAUTHORIZED_INTRUDER_ALTERATION';
  tamperBlockForDemo(blockId, forgedActor);

  const integrity = verifyLedgerIntegrity();
  return {
    success: true,
    action: 'Simulated unauthorized byte tampering in ledger row',
    block_id: blockId,
    tampered_actor: forgedActor,
    integrity_result: integrity
  };
});

// Reset Database to Pristine Seeded State
fastify.post('/api/ledger/reset', async () => {
  db.exec('DROP TABLE IF EXISTS certificates; DROP TABLE IF EXISTS custody_ledger; DROP TABLE IF EXISTS documents; DROP TABLE IF EXISTS cases;');
  seedDatabase();
  return { success: true, message: 'Database reset to verified pristine state' };
});

// 5. BSA 2023 Section 63 Schedule Certificates
fastify.get('/api/certificates', async (req) => {
  const { doc_id } = req.query as { doc_id?: string };
  return getCertificates(doc_id);
});

fastify.post('/api/certificates/generate', async (req, reply) => {
  const body = req.body as any;
  if (!body.doc_id) {
    return reply.status(400).send({ error: 'doc_id is required' });
  }

  const doc = getDocumentById(body.doc_id) as any;
  if (!doc) {
    return reply.status(404).send({ error: 'Document not found' });
  }

  const certId = `CERT-BSA23-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const certData = {
    cert_id: certId,
    doc_id: doc.doc_id,
    case_id: doc.case_id,
    cert_type: 'BSA_2023_SECTION_63',
    part_a_officer: body.part_a_officer || 'Inspector Vikramaditya Sharma',
    part_a_designation: body.part_a_designation || 'Investigating Officer / Person in-charge of Computer Device',
    part_a_declaration: body.part_a_declaration || 'I hereby certify that the electronic record was produced by the computer during the period over which the computer was used regularly to store or process information. The computer was operating properly throughout the said period and lawful custody has been continuously maintained.',
    part_a_signed_at: now,
    part_b_expert: body.part_b_expert || 'Dr. Ananya Sen',
    part_b_designation: body.part_b_designation || 'Senior Scientific Officer / Digital Evidence Expert',
    part_b_declaration: body.part_b_declaration || 'I certify that the cryptographic hash algorithm SHA-256 was applied to the electronic record and the calculated digital signature/hash value matches the genuine bit-stream profile. No subsequent modification, truncation or manipulation has occurred.',
    part_b_signed_at: now,
    hash_value: doc.sha256_hash,
    algorithm: 'SHA-256 (NIST FIPS 180-4)',
    qr_payload: `LEXIS-VAULT://VERIFY?doc=${doc.doc_id}&hash=${doc.sha256_hash}&cert=${certId}&auth=GOVT_OF_INDIA`,
    created_at: now
  };

  insertCertificate(certData);

  // Log SIGN / CERTIFY in ledger
  appendLedgerEntry({
    actor_id: 'BSA-SCHEDULE-ENGINE',
    actor_name: certData.part_a_officer,
    actor_role: 'Investigating Officer & FSL Expert',
    action: 'SIGN',
    doc_id: doc.doc_id,
    case_id: doc.case_id,
    details: {
      action: 'BSA 2023 Section 63 Schedule Certificate Issued',
      cert_id: certId,
      dual_signatures: [certData.part_a_officer, certData.part_b_expert],
      hash_certified: doc.sha256_hash
    }
  });

  return certData;
});

// 6. Courtroom Instant Hash / Document Verification
fastify.post('/api/verify/hash', async (req) => {
  const body = req.body as any;
  const targetHash = (body.hash || '').trim().toLowerCase();
  const targetContent = body.content || '';

  const queryHash = targetHash || (targetContent ? computeSha256(targetContent) : '');

  if (!queryHash) {
    return {
      verified: false,
      verdict: 'NO_HASH_OR_CONTENT_PROVIDED',
      message: 'Please provide either a SHA-256 hash or document text to verify.'
    };
  }

  // Cross-reference documents
  const docQuery = db.prepare('SELECT * FROM documents WHERE LOWER(sha256_hash) = ? OR LOWER(sha512_hash) = ?');
  const matchedDoc = docQuery.get(queryHash, queryHash) as any;

  if (matchedDoc) {
    const caseData = getCaseById(matchedDoc.case_id) as any;
    const certQuery = db.prepare('SELECT * FROM certificates WHERE doc_id = ? LIMIT 1');
    const certificate = certQuery.get(matchedDoc.doc_id);
    const ledger = getLedger().filter(b => b.doc_id === matchedDoc.doc_id);
    const integrity = verifyLedgerIntegrity();

    return {
      verified: true,
      verdict: 'AUTHENTIC_COURT_ADMISSIBLE_EVIDENCE',
      confidence: '100% CRYPTOGRAPHIC MATCH',
      hash_verified: queryHash,
      algorithm: queryHash.length === 64 ? 'SHA-256' : 'SHA-512',
      document: {
        doc_id: matchedDoc.doc_id,
        title: matchedDoc.title,
        doc_type: matchedDoc.doc_type,
        file_name: matchedDoc.file_name,
        created_at: matchedDoc.created_at,
        created_by: matchedDoc.created_by,
        status: matchedDoc.status
      },
      case_details: caseData,
      bsa_certificate: certificate || null,
      ledger_history_count: ledger.length,
      ledger_overall_intact: integrity.intact,
      timestamp_first_recorded: matchedDoc.created_at
    };
  }

  return {
    verified: false,
    verdict: 'HASH_MISMATCH_POTENTIAL_FORGERY',
    confidence: '0% MATCH IN WORM VAULT',
    hash_verified: queryHash,
    message: 'The submitted document hash does not exist in the official police evidence vault or has been modified after initial forensic acquisition.'
  };
});

// Start Fastify Server on Port 3001
const PORT = 3001;
try {
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[LEXIS-VAULT SERVER] Running on http://127.0.0.1:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
