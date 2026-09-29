import { db, initDb, insertDocument, appendLedgerEntry, insertCertificate } from './db.ts';
import { computeSha256, computeSha512 } from './crypto.ts';

export function seedDatabase() {
  initDb();

  // Check if cases already seeded
  const check = db.prepare('SELECT COUNT(*) as count FROM cases').get() as { count: number };
  if (check.count > 0) {
    return;
  }

  // 1. Seed Cases
  const insertCase = db.prepare(`
    INSERT INTO cases (
      case_id, case_number, title, crime_head, jurisdiction, station, status,
      sections_of_law, investigating_officer, io_badge, incident_date, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCase.run(
    'CASE-2024-ND-0142',
    'FIR No. 142/2024',
    'State vs. Rajesh Varma & Syndicate (Cyber Fraud & Multi-State Identity Theft)',
    'Cyber Financial Crime & Syndicate Identity Theft',
    'Special Cell / Cyber Crime PS Central, New Delhi',
    'Cyber Crime PS Central',
    'CHARGE_SHEETED',
    'Sec 318(4) BNS, Sec 316(2) BNS, Sec 66C & 66D IT Act 2000',
    'Inspector Vikramaditya Sharma',
    'DL-CP-44821',
    '2024-05-12T04:30:00Z',
    '2024-05-12T07:15:00Z'
  );

  insertCase.run(
    'CASE-2024-MH-0088',
    'FIR No. 88/2024',
    'State vs. Farhan Sheikh & Ors (Armed Robbery & Firearm Recovery)',
    'Heinous Armed Robbery & Illegal Firearm Possession',
    'Bandra Police Station, Mumbai Western Zone',
    'Bandra PS',
    'UNDER_INVESTIGATION',
    'Sec 309(4) BNS, Sec 311 BNS, Sec 3/25 Arms Act 1959',
    'Senior PI Rajesh Salunkhe',
    'MH-MUM-1109',
    '2024-08-03T18:15:00Z',
    '2024-08-03T20:00:00Z'
  );

  insertCase.run(
    'CASE-2024-KA-0204',
    'FIR No. 204/2024',
    'State vs. Inter-State Narcotics Syndicate (Special Cell)',
    'Commercial Quantity Narcotics Seizure',
    'Narcotics Enforcement Wing, Bengaluru City',
    'NCC Bengaluru',
    'EVIDENCE_COLLECTION',
    'Sec 8(c), 20(b)(ii)(C), 29 NDPS Act 1985',
    'ACP R. Sundaram',
    'KA-BLR-0092',
    '2024-09-14T21:00:00Z',
    '2024-09-15T02:30:00Z'
  );

  // 2. Seed Documents for Case 1 (FIR No. 142/2024)
  const firContent = `GOVERNMENT OF NCT OF DELHI - DELHI POLICE
FIRST INFORMATION REPORT (Under Section 173 BNSS / Sec 154 CrPC)
1. District: Central | Police Station: Cyber Crime PS Central | Year: 2024 | FIR No: 142/2024
2. Acts & Sections:
   (i) Bharatiya Nyaya Sanhita 2023 - Section 318(4) (Cheating and dishonestly inducing delivery of property)
   (ii) Bharatiya Nyaya Sanhita 2023 - Section 316(2) (Criminal breach of trust)
   (iii) Information Technology Act 2000 - Section 66C (Identity Theft) & Section 66D (Cheating by personation by using computer resource)
3. Occurrence of Offence:
   Day/Date: Between 02-05-2024 and 10-05-2024
   Information Received at PS: 12-05-2024 07:15 HRS | GD Entry No: 014A
4. Complainant:
   Name: Amitava Roy (Chief Risk Officer, Apex Mercantile Bank Ltd.)
   Office Address: 14 Barakhamba Road, Connaught Place, New Delhi - 110001
5. Brief Description of Incident:
   A sophisticated spoofed gateway intercepted banking session tokens across 41 corporate accounts, funneling Rs. 4,82,50,000/- into 18 mule beneficiary accounts registered under forged Aadhaar and PAN documents. Network telemetry points to an unauthorized egress cluster operating out of Sector 62, Noida.
6. Investigating Officer Assigned: Inspector Vikramaditya Sharma (Badge DL-CP-44821)`;

  const seizureContent = `DELHI POLICE CYBER CRIME CELL - SEIZURE MEMO / PANCHNAMA
(Under Section 105 BNSS / Sec 102 CrPC)
Case Reference: FIR No. 142/2024 u/s 318(4) BNS, 66C/66D IT Act
Date & Time of Seizure: 14-05-2024 at 16:30 HRS
Location: Flat 402, Block C, Silver Oak Apartments, Sector 62, Noida, Gautam Buddha Nagar, UP.

Panch Witnesses:
1. Ramesh Chander, S/o Late K.L. Chander, R/o Flat 401, Silver Oak Apts.
2. Mahendra Pal Singh, S/o H.P. Singh, R/o Flat 403, Silver Oak Apts.

Articles & Digital Media Seized:
Item #1: Western Digital Red Pro 4TB SATA Hard Drive (S/N: WDC-WMC4N0E87291) extracted from Primary Proxy Server. Placed in anti-static Faraday pouch #FP-014.
Item #2: Apple iPhone 14 Pro Space Black (IMEI 1: 356891102948211, IMEI 2: 356891102948229) with dual SIM cards (Airtel & Jio). Seized in running state, flight mode enabled.
Item #3: SanDisk Extreme Pro 128GB USB 3.2 Flash Drive (S/N: SD-CZ880-9921) containing encrypted keystroke logs and banking payloads.

Custody Chain Declaration:
All articles were labeled, sealed with Delhi Police brass seal impression 'DP-CC-IV' in the presence of witnesses, and deposited into Police Malkhana register under Diary Entry MK-2024-912.`;

  const fslContent = `FORENSIC SCIENCE LABORATORY - GOVERNMENT OF NCT OF DELHI
SECTOR 14, ROHINI, DELHI - 110085
CYBER FORENSICS & DIGITAL EVIDENCE EXAMINATION REPORT
Report No: FSL/DL/2024/CY-8821 | Date: 18-06-2024
To: The Station House Officer / IO, Cyber Crime PS Central, New Delhi
Ref: FIR No. 142/2024 u/s 318(4) BNS & 66C/66D IT Act

1. Description of Parcels Received:
   Parcel 'E-1' with intact Delhi Police seal 'DP-CC-IV': Western Digital 4TB HDD (S/N: WDC-WMC4N0E87291).
   Parcel 'E-2' with intact seal: Apple iPhone 14 Pro (IMEI: 356891102948211).

2. Forensic Acquisition Procedure:
   Bit-stream physical forensic duplicates were acquired using Tableau TX1 Forensic Imager with hardware write-blocker enabled.
   Acquisition Hash Verification:
   - Original HDD SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
   - Forensic Image SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
   (Hashes matched perfectly. Zero modification to original media during forensic extraction).

3. Technical Findings:
   Analysis of directory /var/log/auth.log and SQL dumps revealed automated Python scripts triggering spoofed SMS OTP bypass and executing reverse SSH tunnels to offshore IP 185.220.101.5. Evidence proves active role of Accused Rajesh Varma in orchestrating phishing gateway.

4. Expert Certification:
   Report signed by Dr. Ananya Sen, Senior Scientific Officer (Cyber Forensics), FSL Delhi. Valid for admissibility under Section 63 Bharatiya Sakshya Adhiniyam, 2023.`;

  const chargeSheetContent = `IN THE COURT OF CHIEF METROPOLITAN MAGISTRATE, CENTRAL DISTRICT, TIS HAZARI COURTS, DELHI
FINAL FORM / POLICE REPORT (Under Section 193 BNSS / Section 173 CrPC)
Police Station: Cyber Crime PS Central | FIR No: 142/2024 | Date of Charge Sheet: 28-07-2024

State vs.
1. Rajesh Varma, S/o Satish Varma, Aged 34, R/o Noida (In Judicial Custody)
2. Neeraj Saxena, S/o R.P. Saxena, Aged 29, R/o Ghaziabad (In Judicial Custody)
3. Alexey Voronov (Absconding / Red Corner Notice Requested)

Charge:
That the accused persons formed a criminal syndicate between May 2023 and May 2024, cheated Apex Mercantile Bank Ltd. of Rs. 4.82 Crores using spoofed banking APIs, and laundered the proceeds via cryptocurrency wallets.

List of Documentary & Electronic Evidence Submitted:
1. First Information Report No. 142/2024 (Ex. P-1)
2. Panchnama & Seizure Memo of Hardware & Mobiles (Ex. P-2)
3. FSL Forensic Examination Report FSL/DL/2024/CY-8821 (Ex. P-3)
4. Bank Account statements and Mule KYC documents (Ex. P-4 to P-22)
5. Mandatory Certificate under Section 63 BSA 2023 signed by IO & FSL Examiner (Ex. P-23)

Submitted by: Inspector Vikramaditya Sharma (IO) | Forwarded by: ACP K.K. Rao, ACP Cyber Cell`;

  const docs = [
    {
      doc_id: 'DOC-2024-001',
      case_id: 'CASE-2024-ND-0142',
      title: 'First Information Report (FIR Form No. 1)',
      doc_type: 'FIR',
      file_name: 'FIR_142_2024_CyberPS.pdf',
      file_size: 248920,
      mime_type: 'application/pdf',
      status: 'VERIFIED_ORIGINAL',
      created_at: '2024-05-12T07:30:00Z',
      created_by: 'Inspector Vikramaditya Sharma',
      uploader_role: 'Investigating Officer',
      raw_content: firContent,
      metadata_json: JSON.stringify({
        station: 'Cyber Crime PS Central',
        acts: ['BNS 318(4)', 'BNS 316(2)', 'IT Act 66C/66D'],
        complainant: 'Amitava Roy',
        amount_involved: 'INR 4,82,50,000'
      })
    },
    {
      doc_id: 'DOC-2024-002',
      case_id: 'CASE-2024-ND-0142',
      title: 'Digital Evidence Seizure Memo & Panchnama',
      doc_type: 'SEIZURE_MEMO',
      file_name: 'Seizure_Memo_DigitalAssets_MK912.pdf',
      file_size: 412850,
      mime_type: 'application/pdf',
      status: 'VERIFIED_ORIGINAL',
      created_at: '2024-05-14T17:00:00Z',
      created_by: 'Inspector Vikramaditya Sharma',
      uploader_role: 'Investigating Officer',
      raw_content: seizureContent,
      metadata_json: JSON.stringify({
        malkhana_id: 'MK-2024-912',
        items: ['Western Digital 4TB HDD', 'Apple iPhone 14 Pro', 'SanDisk 128GB Flash Drive'],
        witnesses: ['Ramesh Chander', 'Mahendra Pal Singh']
      })
    },
    {
      doc_id: 'DOC-2024-003',
      case_id: 'CASE-2024-ND-0142',
      title: 'FSL Forensic Examination & Bit-Stream Report',
      doc_type: 'FSL_REPORT',
      file_name: 'FSL_Report_CY8821_FSLRohini.pdf',
      file_size: 891200,
      mime_type: 'application/pdf',
      status: 'VERIFIED_ORIGINAL',
      created_at: '2024-06-18T11:45:00Z',
      created_by: 'Dr. Ananya Sen',
      uploader_role: 'Forensic Expert',
      raw_content: fslContent,
      metadata_json: JSON.stringify({
        fsl_lab: 'FSL Rohini Delhi',
        expert_name: 'Dr. Ananya Sen',
        tools_used: ['Tableau TX1', 'EnCase Forensic', 'Volatility Memory Framework'],
        hash_algorithm: 'SHA-256'
      })
    },
    {
      doc_id: 'DOC-2024-004',
      case_id: 'CASE-2024-ND-0142',
      title: 'Final Police Report & Charge Sheet u/s 193 BNSS',
      doc_type: 'CHARGE_SHEET',
      file_name: 'Charge_Sheet_142_2024_TisHazari.pdf',
      file_size: 1450200,
      mime_type: 'application/pdf',
      status: 'VERIFIED_ORIGINAL',
      created_at: '2024-07-28T14:20:00Z',
      created_by: 'Inspector Vikramaditya Sharma',
      uploader_role: 'Investigating Officer',
      raw_content: chargeSheetContent,
      metadata_json: JSON.stringify({
        court: 'Chief Metropolitan Magistrate, Tis Hazari Courts, Delhi',
        accused_in_custody: ['Rajesh Varma', 'Neeraj Saxena'],
        absconding: ['Alexey Voronov'],
        total_witnesses: 19
      })
    }
  ];

  for (const doc of docs) {
    const sha256 = computeSha256(doc.raw_content);
    const sha512 = computeSha512(doc.raw_content);

    insertDocument({
      ...doc,
      sha256_hash: sha256,
      sha512_hash: sha512
    });

    // Ingest block in ledger
    appendLedgerEntry({
      actor_id: doc.uploader_role === 'Forensic Expert' ? 'FSL-EXP-884' : 'IO-DL-44821',
      actor_name: doc.created_by,
      actor_role: doc.uploader_role,
      action: 'INGEST',
      doc_id: doc.doc_id,
      case_id: doc.case_id,
      details: {
        document_title: doc.title,
        doc_type: doc.doc_type,
        file_name: doc.file_name,
        sha256: sha256,
        sha512: sha512,
        ingestion_source: 'Direct Terminal Ingestion (Secure Enclave)'
      }
    });
  }

  // 3. Add realistic view, redaction, and verification blocks to the ledger
  appendLedgerEntry({
    actor_id: 'SHO-DL-0012',
    actor_name: 'ACP K.K. Rao',
    actor_role: 'Station House Officer',
    action: 'VIEW',
    doc_id: 'DOC-2024-001',
    case_id: 'CASE-2024-ND-0142',
    details: {
      action: 'Case Supervision Review',
      ip_address: '10.42.18.9',
      terminal: 'SECURE-TERM-04'
    }
  });

  appendLedgerEntry({
    actor_id: 'IO-DL-44821',
    actor_name: 'Inspector Vikramaditya Sharma',
    actor_role: 'Investigating Officer',
    action: 'REDACT',
    doc_id: 'DOC-2024-001',
    case_id: 'CASE-2024-ND-0142',
    details: {
      reason: 'Masking sensitive financial institution routing keys and internal gateway IP',
      mask_algorithm: 'SHA256_SALTED_CANVAS',
      statutory_compliance: 'Section 228A IPC / DPDP Act 2023'
    }
  });

  appendLedgerEntry({
    actor_id: 'JUDGE-TH-902',
    actor_name: 'Hon. Justice Arvind K. Grover (CMM Tis Hazari)',
    actor_role: 'Judicial Magistrate',
    action: 'VERIFY',
    doc_id: 'DOC-2024-003',
    case_id: 'CASE-2024-ND-0142',
    details: {
      court: 'Court Room No. 34, Tis Hazari Courts',
      verification_verdict: 'AUTHENTIC_EVIDENCE',
      hash_matched: true,
      timestamp_accuracy_verified: true
    }
  });

  // 4. Seed BSA 2023 Section 63 Schedule Certificate
  const fslDocHash = computeSha256(fslContent);
  insertCertificate({
    cert_id: 'CERT-BSA23-2024-0091',
    doc_id: 'DOC-2024-003',
    case_id: 'CASE-2024-ND-0142',
    cert_type: 'BSA_2023_SECTION_63',
    part_a_officer: 'Inspector Vikramaditya Sharma',
    part_a_designation: 'Investigating Officer, Cyber Crime PS Central',
    part_a_declaration: 'I hereby certify that the computer resource and digital imaging station used in acquiring digital exhibits remained under my lawful custody throughout the investigation. The device operated properly at all relevant times without any unauthorized intervention or alteration.',
    part_a_signed_at: '2024-07-28T15:00:00Z',
    part_b_expert: 'Dr. Ananya Sen',
    part_b_designation: 'Senior Scientific Officer (Cyber Forensics), FSL Delhi',
    part_b_declaration: 'I have examined the digital exhibit and computed its cryptographic fingerprint using standard NIST-compliant cryptographic routines. I certify that the SHA-256 hash value represents the true and unmodified digital artifact.',
    part_b_signed_at: '2024-07-28T16:30:00Z',
    hash_value: fslDocHash,
    algorithm: 'SHA-256 (NIST FIPS 180-4)',
    qr_payload: `LEXIS-VAULT://VERIFY?doc=DOC-2024-003&hash=${fslDocHash}&cert=CERT-BSA23-2024-0091&auth=GOVT_OF_INDIA`,
    created_at: '2024-07-28T16:35:00Z'
  });
}
