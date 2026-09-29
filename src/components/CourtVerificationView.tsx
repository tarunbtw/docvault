import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  ShieldAlert,
  Search,
  FileCheck2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { VerificationResult, DocumentItem } from '@/services/api';

interface CourtVerificationViewProps {
  documents: DocumentItem[];
  onVerify: (query: { hash?: string; content?: string }) => Promise<VerificationResult>;
  onSelectDocument: (doc: DocumentItem) => void;
}

export function CourtVerificationView({
  documents,
  onVerify,
  onSelectDocument
}: CourtVerificationViewProps) {
  const [inputHash, setInputHash] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const firDoc = documents.find(d => d.doc_type === 'FIR');
  const fslDoc = documents.find(d => d.doc_type === 'FSL_REPORT');

  const handleVerify = async () => {
    if (!inputHash && !textContent) return;
    setIsVerifying(true);
    try {
      const res = await onVerify({ hash: inputHash, content: textContent });
      setResult(res);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePresetGenuineFir = () => {
    if (firDoc) {
      setInputHash(firDoc.sha256_hash);
      setTextContent('');
      setResult(null);
    }
  };

  const handlePresetGenuineFsl = () => {
    if (fslDoc) {
      setInputHash(fslDoc.sha256_hash);
      setTextContent('');
      setResult(null);
    }
  };

  const handlePresetForged = () => {
    setInputHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855_FORGED');
    setTextContent('Altered witness statement with modified suspect name.');
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
          <Scale className="w-5 h-5 text-neutral-300" />
          Courtroom & Judicial Evidence Verification Portal
        </h2>
        <p className="text-xs text-neutral-400 font-mono">
          Instant cryptographic validation of electronic records for Judges, Public Prosecutors, and Defense Counsel
        </p>
      </div>

      {/* Input Section */}
      <Card className="bg-neutral-950 border-neutral-700">
        <CardHeader className="bg-neutral-900/50 border-b border-neutral-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm">Submit Document Cryptographic Fingerprint for Verification</CardTitle>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Check whether an electronic record matches the WORM repository and has intact BSA 2023 Section 63 certification.
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-mono text-neutral-500 mr-1">Demo Quick Tests:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePresetGenuineFir}
                className="text-[10px]"
              >
                Genuine FIR #142/2024
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePresetGenuineFsl}
                className="text-[10px]"
              >
                Genuine FSL Lab Report
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handlePresetForged}
                className="text-[10px]"
              >
                Simulate Forged File
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4 font-mono text-xs">
          <div>
            <label className="text-neutral-400 uppercase text-[10px] block mb-1">
              Enter SHA-256 or SHA-512 Fingerprint
            </label>
            <Input
              placeholder="e.g. 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
            />
          </div>

          <div className="relative flex items-center justify-center my-2">
            <span className="bg-neutral-950 px-3 text-neutral-500 text-[10px] uppercase">
              Or verify raw document bit-stream / text
            </span>
          </div>

          <div>
            <textarea
              rows={4}
              placeholder="Paste document text or drop official record here to calculate on-the-fly hash..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-xs text-xs focus:outline-none focus:border-neutral-600 font-mono"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={handleVerify}
              disabled={isVerifying || (!inputHash && !textContent)}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              {isVerifying ? 'Cross-referencing WORM Vault...' : 'Run Courtroom Admissibility Verification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Verdict Result Display */}
      {result && (
        <Card
          className={`border-2 transition-all ${
            result.verified
              ? 'border-neutral-400 bg-neutral-950 text-neutral-100 shadow-2xl'
              : 'border-white bg-white text-black font-semibold shadow-2xl'
          }`}
        >
          <div className="p-6 space-y-6 font-mono">
            {/* Header Stamp */}
            <div className="flex items-center justify-between border-b pb-4 border-current/20">
              <div className="flex items-center gap-3">
                {result.verified ? (
                  <div className="w-12 h-12 border border-neutral-600 bg-neutral-900 flex items-center justify-center rounded-xs">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 border border-black bg-black flex items-center justify-center rounded-xs">
                    <ShieldAlert className="w-7 h-7 text-white" />
                  </div>
                )}
                <div>
                  <div className="text-xs uppercase tracking-widest font-semibold opacity-75">
                    Judicial Authenticity Certification Verdict
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-wider">
                    {result.verdict.replace(/_/g, ' ')}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <Badge variant={result.verified ? 'solid' : 'warning'} className="text-xs px-3 py-1">
                  {result.confidence || (result.verified ? '100% CRYPTOGRAPHIC MATCH' : '0% MATCH')}
                </Badge>
              </div>
            </div>

            {/* Verdict Body */}
            {result.verified ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-neutral-800 bg-neutral-900/40 rounded-xs">
                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Verified Exhibit Title</span>
                    <span className="text-white font-bold text-sm">{result.document?.title}</span>
                    <span className="text-neutral-400 block text-[11px] mt-0.5">
                      Doc ID: {result.document?.doc_id} • Type: {result.document?.doc_type}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Linked Case Docket</span>
                    <span className="text-white font-bold text-sm">
                      {result.case_details?.case_number}
                    </span>
                    <span className="text-neutral-400 block text-[11px] mt-0.5">
                      {result.case_details?.title}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">Original Ingestion Point</span>
                    <span className="text-neutral-200">
                      {result.document?.created_by} ({result.case_details?.station})
                    </span>
                    <span className="text-neutral-400 block text-[10px]">
                      Timestamp: {formatDate(result.document?.created_at || '')}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 uppercase text-[10px] block">BSA 2023 Sec 63 Certification</span>
                    <span className="text-neutral-200 font-semibold flex items-center gap-1.5 mt-0.5">
                      <Award className="w-3.5 h-3.5 text-neutral-300" />
                      {result.bsa_certificate ? 'DUAL-SIGNED & ADMISSIBLE' : 'PENDING CO-SIGNATURE'}
                    </span>
                    <span className="text-neutral-400 block text-[10px]">
                      Chain of Custody Events: {result.ledger_history_count} Verified Touchpoints
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-neutral-800 bg-neutral-900/60 rounded-xs text-[11px] text-neutral-300 space-y-1">
                  <span className="text-white font-semibold block uppercase">Judicial Notice:</span>
                  <p>
                    The submitted hash fingerprint matches the bit-stream recorded at the time of seizure in the police repository. Under Section 61 and Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, this electronic record is eligible for statutory admission in evidence without requiring production of the primary physical source device.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 border border-black/20 bg-neutral-100 rounded-xs text-neutral-950 space-y-2">
                  <span className="font-bold text-sm block uppercase">Forensic Discrepancy Alert:</span>
                  <p className="text-xs leading-relaxed">
                    {result.message || 'The submitted document hash does not exist in the police evidence repository, or has been altered post-acquisition. The document fails evidentiary integrity standards.'}
                  </p>
                  <div className="text-[10px] font-mono opacity-80 pt-1">
                    Hash Checked: {result.hash_verified}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
