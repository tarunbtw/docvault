import React, { useState, useEffect } from 'react';
import {
  Header,
  USER_ROLES,
  type UserRole
} from '@/components/Header';
import { CasesView } from '@/components/CasesView';
import { EvidenceVaultView } from '@/components/EvidenceVaultView';
import { BsaCertificateView } from '@/components/BsaCertificateView';
import { LedgerView } from '@/components/LedgerView';
import { CourtVerificationView } from '@/components/CourtVerificationView';
import { DocumentViewerModal } from '@/components/DocumentViewerModal';
import {
  getHealth,
  getCases,
  getDocuments,
  getCertificates,
  getLedger,
  createCase,
  uploadDocument,
  logDocumentView,
  redactDocument,
  simulateTamper,
  resetDatabase,
  generateCertificate,
  verifyHashOrContent,
  type Case,
  type DocumentItem,
  type Certificate,
  type LedgerBlock,
  type HealthStatus,
  type VerificationResult
} from '@/services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'cases' | 'vault' | 'certificates' | 'ledger' | 'verify'>('cases');
  const [activeRole, setActiveRole] = useState<UserRole>(USER_ROLES[0]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [ledgerBlocks, setLedgerBlocks] = useState<LedgerBlock[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [preselectedCertDocId, setPreselectedCertDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [h, c, d, certs, blocks] = await Promise.all([
        getHealth(),
        getCases(),
        getDocuments(),
        getCertificates(),
        getLedger()
      ]);
      setHealth(h);
      setCases(c);
      setDocuments(d);
      setCertificates(certs);
      setLedgerBlocks(blocks);
    } catch (err) {
      console.error('Failed to load Lexis-Vault data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleDocumentSelect = async (doc: DocumentItem) => {
    setSelectedDocument(doc);
    // Log forensic view event in Merkle ledger
    try {
      await logDocumentView(doc.doc_id, {
        name: activeRole.name,
        role: activeRole.role,
        id: activeRole.badge
      });
      // Refresh ledger in background
      const [h, blocks] = await Promise.all([getHealth(), getLedger()]);
      setHealth(h);
      setLedgerBlocks(blocks);
    } catch (err) {
      console.error('Failed to log document view:', err);
    }
  };

  const handleRedact = async (docId: string, redactedContent: string, reason: string) => {
    await redactDocument(docId, redactedContent, reason);
    await loadData();
    // Update local modal state
    if (selectedDocument && selectedDocument.doc_id === docId) {
      setSelectedDocument({
        ...selectedDocument,
        is_redacted: 1,
        redacted_content: redactedContent
      });
    }
  };

  const handleGenerateCertTrigger = (docId: string) => {
    setPreselectedCertDocId(docId);
    setSelectedDocument(null);
    setActiveTab('certificates');
  };

  const handleCreateCase = async (newCasePayload: Partial<Case>) => {
    await createCase(newCasePayload);
    await loadData();
  };

  const handleUploadDocument = async (payload: any) => {
    await uploadDocument(payload);
    await loadData();
  };

  const handleGenerateCertificate = async (payload: any) => {
    await generateCertificate(payload);
    await loadData();
  };

  const handleSimulateTamper = async (blockId = 2) => {
    await simulateTamper(blockId);
    await loadData();
  };

  const handleResetVault = async () => {
    await resetDatabase();
    await loadData();
  };

  const handleVerifyHash = async (query: { hash?: string; content?: string }): Promise<VerificationResult> => {
    return verifyHashOrContent(query);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-neutral-800 selection:text-white">
      {/* Header */}
      <Header
        health={health}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onRefreshHealth={loadData}
        activeTab={activeTab}
        onTabChange={(tab: any) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {loading ? (
          <div className="py-24 text-center font-mono text-xs text-neutral-500">
            Initializing Secure Cryptographic Enclave & Verifying WORM Vault...
          </div>
        ) : (
          <>
            {activeTab === 'cases' && (
              <CasesView
                cases={cases}
                activeRole={activeRole}
                onSelectDocument={handleDocumentSelect}
                onCreateCase={handleCreateCase}
              />
            )}

            {activeTab === 'vault' && (
              <EvidenceVaultView
                documents={documents}
                cases={cases}
                activeRole={activeRole}
                onSelectDocument={handleDocumentSelect}
                onUploadDocument={handleUploadDocument}
                onGenerateCert={handleGenerateCertTrigger}
              />
            )}

            {activeTab === 'certificates' && (
              <BsaCertificateView
                certificates={certificates}
                documents={documents}
                cases={cases}
                activeRole={activeRole}
                preselectedDocId={preselectedCertDocId}
                onGenerateCertificate={handleGenerateCertificate}
              />
            )}

            {activeTab === 'ledger' && (
              <LedgerView
                blocks={ledgerBlocks}
                health={health}
                activeRole={activeRole}
                onRefreshLedger={loadData}
                onSimulateTamper={handleSimulateTamper}
                onResetVault={handleResetVault}
              />
            )}

            {activeTab === 'verify' && (
              <CourtVerificationView
                documents={documents}
                onVerify={handleVerifyHash}
                onSelectDocument={handleDocumentSelect}
              />
            )}
          </>
        )}
      </main>

      {/* Forensic Document Inspector Modal */}
      {selectedDocument && (
        <DocumentViewerModal
          document={selectedDocument}
          activeRole={activeRole}
          onClose={() => setSelectedDocument(null)}
          onRedact={handleRedact}
          onGenerateCert={handleGenerateCertTrigger}
        />
      )}

      {/* Official Government Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 px-4 no-print text-[11px] font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <div className="text-neutral-400 font-semibold uppercase tracking-wider">
              National Criminal Justice & Digital Document Integrity Portal
            </div>
            <div>
              Statutory Admissibility Framework: Bharatiya Sakshya Adhiniyam (BSA), 2023 • Bharatiya Nyaya Sanhita (BNS), 2023 • IT Act 2000
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-neutral-400">
            <span>NIST FIPS 180-4 SHA-256</span>
            <span>•</span>
            <span>WORM Cryptographic Vault</span>
            <span>•</span>
            <span>RSA-2048 PKI Attestation</span>
            <span>•</span>
            <span>ISO/IEC 27037 Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
