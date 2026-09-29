import React, { useState, useEffect } from 'react';
import {
  Header,
  USER_ROLES,
  type UserRole
} from '@/components/Header';
import { OverviewView } from '@/components/OverviewView';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'vault' | 'certificates' | 'ledger' | 'verify'>('overview');
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
    <div className="min-h-screen flex flex-col bg-[#f6f4f1] text-[#111111] selection:bg-[#ea4242] selection:text-white">
      {/* Header matching Reference Image 1 */}
      <Header
        health={health}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        onRefreshHealth={loadData}
        activeTab={activeTab}
        onTabChange={(tab: any) => setActiveTab(tab)}
      />

      {/* Main Content Area - Full screen width with generous padding */}
      <main className="flex-1 w-full px-6 sm:px-10 lg:px-12 py-8 transition-all">
        {loading ? (
          <div className="py-24 text-center font-sans text-xs text-neutral-400">
            <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-[#ea4242] border-t-transparent animate-spin" />
            Initializing Secure Cryptographic Enclave & Verifying WORM Vault...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                cases={cases}
                documents={documents}
                health={health}
                activeRole={activeRole}
                onSelectDocument={handleDocumentSelect}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            )}

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

      {/* Refined Minimalist Production Footer */}
      <footer className="border-t border-[#e2ded6] bg-white py-6 px-6 sm:px-10 lg:px-12 no-print text-[11px] text-neutral-500 transition-colors">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <div className="text-neutral-900 font-semibold uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ea4242]" />
              National Criminal Justice & Digital Document Integrity Portal
            </div>
            <div>
              Statutory Admissibility Framework: Bharatiya Sakshya Adhiniyam (BSA), 2023 §63 • Bharatiya Nyaya Sanhita (BNS), 2023 • IT Act 2000
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-neutral-600 font-medium">
            <span className="bg-[#f6f4f1] px-3 py-1 rounded-xl border border-[#e2ded6]">NIST FIPS 180-4 SHA-256</span>
            <span className="bg-[#f6f4f1] px-3 py-1 rounded-xl border border-[#e2ded6]">WORM Vault</span>
            <span className="bg-[#f6f4f1] px-3 py-1 rounded-xl border border-[#e2ded6]">RSA-2048 PKI Attestation</span>
            <span className="bg-[#f6f4f1] px-3 py-1 rounded-xl border border-[#e2ded6]">ISO/IEC 27037 Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
