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
  ArrowUpRight
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
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-neutral-300" />
            WORM Cryptographic Evidence Vault
          </h2>
          <p className="text-xs text-neutral-400 font-mono">
            Write-Once-Read-Many immutable storage with dual SHA-256 and SHA-512 bit-stream verification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Title, SHA-256, File..."
              className="pl-8"
            />
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Ingest New Exhibit
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <Filter className="w-3.5 h-3.5 text-neutral-500 mr-1" />
        <span className="text-neutral-500 text-[11px] uppercase mr-1">Filter Exhibit Type:</span>
        {docTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedTypeFilter(type)}
            className={`px-3 py-1 rounded-sm border uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
              selectedTypeFilter === type
                ? 'border-white bg-white text-black font-semibold'
                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Vault Table */}
      <Card className="bg-neutral-950 border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900/70 border-b border-neutral-800 text-[10px] uppercase text-neutral-400">
              <tr>
                <th className="p-3.5">Exhibit / Document</th>
                <th className="p-3.5">Case Reference</th>
                <th className="p-3.5">Doc Type</th>
                <th className="p-3.5">Cryptographic SHA-256</th>
                <th className="p-3.5">Ingested By</th>
                <th className="p-3.5">Date Ingested</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-300">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => {
                  const parentCase = cases.find(c => c.case_id === doc.case_id);
                  return (
                    <tr
                      key={doc.doc_id}
                      className="hover:bg-neutral-900/30 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-neutral-100 block hover:underline cursor-pointer" onClick={() => onSelectDocument(doc)}>
                              {doc.title}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {doc.file_name} • {(doc.file_size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="text-neutral-200 font-medium block">
                          {parentCase ? parentCase.case_number : doc.case_id}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {doc.case_id}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px]">
                          {doc.doc_type}
                        </Badge>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <code className="text-neutral-300 text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded-xs">
                            {truncateHash(doc.sha256_hash, 8, 6)}
                          </code>
                          <button
                            onClick={() => handleCopy(doc.sha256_hash)}
                            className="text-neutral-500 hover:text-white p-0.5 cursor-pointer"
                            title="Copy full SHA-256 hash"
                          >
                            {copiedHash === doc.sha256_hash ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-neutral-400 text-[11px]">
                        <div>{doc.created_by}</div>
                        <div className="text-[10px] text-neutral-500">{doc.uploader_role}</div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-neutral-400 text-[11px]">
                        {formatDate(doc.created_at)}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-right space-x-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSelectDocument(doc)}
                          className="gap-1 text-[10px]"
                        >
                          <Eye className="w-3 h-3" />
                          Inspect
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onGenerateCert(doc.doc_id)}
                          className="gap-1 text-[10px]"
                        >
                          <Award className="w-3 h-3" />
                          BSA Cert
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-700 w-full max-w-xl rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Ingest Digital Exhibit into WORM Vault
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Select Target Case Docket *</label>
                <select
                  value={uploadCaseId}
                  onChange={(e) => setUploadCaseId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-2 rounded-xs focus:outline-none focus:border-neutral-600"
                >
                  {cases.map((c) => (
                    <option key={c.case_id} value={c.case_id}>
                      {c.case_number} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Exhibit / Document Title *</label>
                  <Input
                    required
                    placeholder="e.g. CCTV Footage Analysis Memo"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Classification Type</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-2 rounded-xs focus:outline-none focus:border-neutral-600 h-9"
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
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">
                  Document Content / Official Text Record *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste official statement, technical forensic findings, or document transcript..."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-xs font-mono text-xs focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xs text-[10px] text-neutral-400 space-y-1">
                <span className="text-neutral-200 font-semibold block uppercase">Cryptographic Ingestion Guarantee:</span>
                <p>
                  Upon submission, the server will immediately compute SHA-256 and SHA-512 hashes, apply WORM storage locking, and append an immutable block to the Merkle ledger under officer credential <strong>{activeRole.badge}</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
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
