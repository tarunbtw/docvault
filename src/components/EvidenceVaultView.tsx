import React, { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  Search,
  FileText,
  Lock,
  Copy,
  Check,
  Eye,
  Award,
  Filter,
  ArrowUpRight,
  HardDrive,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate, truncateHash } from '@/lib/utils';
import type { Case, DocumentItem } from '@/services/api';
import type { UserRole } from './Header';

interface EvidenceVaultViewProps {
  documents: DocumentItem[];
  cases: Case[];
  activeRole: UserRole;
  onSelectDocument: (doc: DocumentItem) => void;
  onUploadDocument: (payload: any) => Promise<void>;
  onGenerateCert: (docId: string) => void;
}

export function EvidenceVaultView({
  documents,
  cases,
  activeRole,
  onSelectDocument,
  onUploadDocument,
  onGenerateCert
}: EvidenceVaultViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // New exhibit form state
  const [uploadCaseId, setUploadCaseId] = useState(cases[0]?.case_id || '');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('CASE_RECORD');
  const [uploadContent, setUploadContent] = useState('');

  const docTypes = ['ALL', 'FIR', 'SEIZURE_MEMO', 'FSL_REPORT', 'CHARGE_SHEET', 'CASE_RECORD'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.sha256_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.case_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'ALL' || doc.doc_type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadContent) return;

    await onUploadDocument({
      case_id: uploadCaseId,
      title: uploadTitle,
      doc_type: uploadType,
      file_name: `${uploadTitle.replace(/\s+/g, '_')}.pdf`,
      content: uploadContent,
      created_by: activeRole.name,
      uploader_role: activeRole.role,
      uploader_id: activeRole.badge
    });

    setIsUploadOpen(false);
    setUploadTitle('');
    setUploadContent('');
  };

  return (
    <div className="space-y-8 pb-16 font-sans animate-view-fade">
      
      {/* Designer Hero Card with Abstract Cryptographic Enclave Art */}
      <div className="relative bg-white border border-[#e2ded6] rounded-2xl p-7 shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Abstract Cryptographic Lattice Vector (Corner Art) */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-20">
          <svg width="320" height="220" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="180" y="20" width="80" height="80" rx="20" stroke="black" strokeWidth="1.5" />
            <rect x="220" y="60" width="80" height="80" rx="20" stroke="#ea4242" strokeWidth="1.8" />
            <circle cx="260" cy="100" r="40" stroke="black" strokeWidth="1.2" strokeDasharray="4 4" />
            <line x1="120" y1="180" x2="300" y2="180" stroke="#ea4242" strokeWidth="1.5" />
            <circle cx="160" cy="180" r="5" fill="black" />
            <circle cx="220" cy="180" r="5" fill="#ea4242" />
            <circle cx="280" cy="180" r="5" fill="black" />
          </svg>
        </div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs shadow-xs">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white bg-[#ea4242] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              WORM Cryptographic Vault
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
            Immutable Digital Evidence Repository
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Write-Once-Read-Many (WORM) storage enclave computing dual SHA-256 & SHA-512 hashes upon ingestion, preventing post-seizure file tampering.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              {documents.length} Total Preserved Bitstreams
            </span>
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              NIST FIPS 180-4 Verified
            </span>
            <span className="text-xs font-bold font-mono bg-black text-white px-3 py-1 rounded-xl border border-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ea4242]" /> WORM LOCK ACTIVE
            </span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, SHA-256, Case..."
              className="pl-10 h-11 bg-[#f6f4f1] border-[#e2ded6] rounded-xl text-xs font-medium focus:bg-white"
            />
          </div>

          <Button
            variant="default"
            size="default"
            onClick={() => setIsUploadOpen(true)}
            className="h-11 px-5 shadow-xs gap-2 font-bold text-xs bg-black hover:bg-neutral-800 text-white rounded-xl shrink-0"
          >
            <Upload className="w-4 h-4 text-[#ea4242]" />
            Ingest Exhibit
          </Button>
        </div>
      </div>

      {/* Filter Chips matching Reference Pill group */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 text-xs">
        <Filter className="w-4 h-4 text-neutral-400 mr-1" />
        <span className="text-neutral-500 text-xs font-bold mr-1">Classification Filter:</span>
        {docTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedTypeFilter(type)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedTypeFilter === type
                ? 'bg-black text-white shadow-xs'
                : 'bg-white border border-[#e8e5df] text-neutral-700 hover:border-black'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Vault Table */}
      <Card className="bg-white border-[#e8e5df] rounded-[32px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f4f1]/80 border-b border-[#f1eee8] text-xs uppercase tracking-wider text-neutral-500 font-bold">
              <tr>
                <th className="p-5 pl-8">Exhibit / Document</th>
                <th className="p-5">Case Reference</th>
                <th className="p-5">Doc Type</th>
                <th className="p-5">Cryptographic SHA-256</th>
                <th className="p-5">Ingested By</th>
                <th className="p-5">Date Ingested</th>
                <th className="p-5 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1eee8] text-neutral-800">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => {
                  const parentCase = cases.find(c => c.case_id === doc.case_id);
                  return (
                    <tr
                      key={doc.doc_id}
                      className="hover:bg-[#f6f4f1]/40 transition-colors"
                    >
                      <td className="p-5 pl-8">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span
                              className="font-bold text-sm text-neutral-900 block hover:text-[#ea4242] cursor-pointer transition-colors"
                              onClick={() => onSelectDocument(doc)}
                            >
                              {doc.title}
                            </span>
                            <span className="text-xs text-neutral-400 mt-0.5 block">
                              {doc.file_name} • {(doc.file_size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-5 whitespace-nowrap">
                        <span className="text-neutral-900 font-bold text-xs block">
                          {parentCase ? parentCase.case_number : doc.case_id}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {doc.case_id}
                        </span>
                      </td>

                      <td className="p-5 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {doc.doc_type}
                        </Badge>
                      </td>

                      <td className="p-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-neutral-800 text-xs bg-[#f6f4f1] border border-[#e8e5df] px-3 py-1 rounded-xl font-mono font-medium">
                            {truncateHash(doc.sha256_hash, 10, 8)}
                          </code>
                          <button
                            onClick={() => handleCopy(doc.sha256_hash)}
                            className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer transition-colors"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === doc.sha256_hash ? (
                              <Check className="w-4 h-4 text-black" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-5 whitespace-nowrap text-neutral-600 text-xs">
                        <div className="font-bold text-neutral-900">{doc.created_by}</div>
                        <div className="text-[11px] text-neutral-400">{doc.uploader_role}</div>
                      </td>

                      <td className="p-5 whitespace-nowrap text-neutral-500 font-mono text-xs">
                        {formatDate(doc.created_at)}
                      </td>

                      <td className="p-5 pr-8 whitespace-nowrap text-right space-x-2.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSelectDocument(doc)}
                          className="gap-1.5 text-xs font-semibold px-4"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onGenerateCert(doc.doc_id)}
                          className="gap-1.5 text-xs font-bold bg-black text-white hover:bg-neutral-800 px-4"
                        >
                          <Award className="w-3.5 h-3.5 text-[#ea4242]" />
                          BSA Cert
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-400 text-sm">
                    No evidence documents matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Ingest Exhibit Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e8e5df] w-full max-w-2xl rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#f1eee8] pb-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-[#ea4242]" />
                Ingest Digital Exhibit into WORM Vault
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-neutral-400 hover:text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-700 block mb-1 text-xs font-bold">Target Case Docket *</label>
                <select
                  value={uploadCaseId}
                  onChange={(e) => setUploadCaseId(e.target.value)}
                  className="w-full bg-white border border-[#e2dfd7] text-neutral-900 p-3 rounded-2xl focus:outline-none focus:border-black text-xs font-medium"
                >
                  {cases.map((c) => (
                    <option key={c.case_id} value={c.case_id}>
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-700 block mb-1 text-xs font-bold">Exhibit / Document Title *</label>
                  <Input
                    required
                    placeholder="e.g. CCTV Footage Analysis Memo"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="rounded-2xl h-11 text-xs"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 block mb-1 text-xs font-bold">Classification Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full bg-white border border-[#e2dfd7] text-neutral-900 p-3 rounded-2xl focus:outline-none focus:border-black text-xs font-medium h-11"
                  >
                    <option value="FIR">FIR Form</option>
                    <option value="SEIZURE_MEMO">Seizure Memo / Panchnama</option>
                    <option value="FSL_REPORT">FSL Forensic Report</option>
                    <option value="WITNESS_STATEMENT">Witness Statement (Sec 180 BNSS)</option>
                    <option value="CHARGE_SHEET">Police Report / Charge Sheet</option>
                    <option value="CASE_RECORD">General Case Record</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 text-xs font-bold">
                  Document Content / Official Text Record *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste official statement, technical forensic findings, or document transcript..."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  className="w-full bg-white border border-[#e2dfd7] text-neutral-900 p-4 rounded-2xl font-mono text-xs focus:outline-none focus:border-black shadow-2xs leading-relaxed"
                />
              </div>

              <div className="p-4 bg-[#f6f4f1] border border-[#e8e5df] rounded-2xl text-xs text-neutral-600 space-y-1 leading-relaxed">
                <span className="text-neutral-900 font-bold block">Cryptographic Ingestion Guarantee:</span>
                <p>
                  Upon submission, the server computes SHA-256 and SHA-512 hashes, applies WORM storage locking, and appends an immutable block to the Merkle ledger under officer credential <strong>{activeRole.badge}</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ece8e1]">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-xl border-[#e2ded6]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  className="rounded-xl bg-black text-white hover:bg-neutral-800 font-bold"
                >
                  Compute Hashes & Ingest
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
