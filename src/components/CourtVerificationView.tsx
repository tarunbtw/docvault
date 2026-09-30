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
  Award,
  Radio,
  Sparkles
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
    <div className="space-y-8 pb-16 font-sans animate-view-fade">
      
      {/* Designer Hero Card with Abstract Radar/Forensic Waveform Art */}
      <div className="relative bg-white border border-[#e2ded6] rounded-2xl p-7 shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Abstract Forensic Waveform Motif */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-20">
          <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 110 Q 80 40, 120 110 T 200 110 T 280 110 T 360 110" stroke="#ea4242" strokeWidth="2" fill="none" />
            <path d="M40 110 Q 90 170, 140 110 T 240 110 T 340 110" stroke="black" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <circle cx="200" cy="110" r="45" stroke="#ea4242" strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="200" cy="110" r="15" fill="#ea4242" />
          </svg>
        </div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs shadow-xs">
              <Scale className="w-4 h-4 text-[#ea4242]" />
            </div>
            <span className="text-[10px] font-bold text-white bg-[#ea4242] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Judicial Admissibility Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
            Courtroom Evidence Verification Portal
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Instant cryptographic validation of electronic records for Judicial Magistrates, Public Prosecutors, and Forensic Defense counsel under Section 61 & 63 of BSA 2023.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              Real-Time SHA-256 Bitstream Check
            </span>
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              BSA 2023 Statutory Admissibility
            </span>
            <span className="text-xs font-bold font-mono bg-black text-white px-3 py-1 rounded-xl border border-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ea4242]" /> JUDICIAL SCANNER READY
            </span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <Card className="bg-white border-[#e2ded6] rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-[#ece8e1] p-7 pb-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-neutral-900 font-extrabold">Submit Document Fingerprint for Validation</CardTitle>
              <p className="text-xs text-neutral-500 mt-1">
                Verifies if electronic evidence matches the immutable WORM vault and possesses valid BSA Section 63 certification.
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-neutral-500 mr-1">Demo Quick Tests:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePresetGenuineFir}
                className="text-xs font-bold rounded-xl border-[#e2ded6] bg-white hover:bg-[#ece8e1]"
              >
                Genuine FIR #142/2024
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePresetGenuineFsl}
                className="text-xs font-bold rounded-xl border-[#e2ded6] bg-white hover:bg-[#ece8e1]"
              >
                Genuine FSL Lab Report
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handlePresetForged}
                className="text-xs font-bold bg-[#ea4242] text-white hover:bg-[#d43838] rounded-xl shadow-xs"
              >
                Simulate Forged File
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6 text-xs">
          <div>
            <label className="text-neutral-700 font-bold text-xs block mb-1.5">
              Enter SHA-256 or SHA-512 Fingerprint
            </label>
            <Input
              placeholder="e.g. 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
              value={inputHash}
              onChange={(e) => setInputHash(e.target.value)}
              className="rounded-2xl font-mono text-xs h-12 shadow-2xs"
            />
          </div>

          <div className="relative flex items-center justify-center my-4">
            <span className="bg-[#f6f4f1] border border-[#e8e5df] px-4 py-1.5 rounded-full text-neutral-600 text-xs font-bold uppercase tracking-wider">
              Or verify raw document bit-stream / text
            </span>
          </div>

          <div>
            <textarea
              rows={4}
              placeholder="Paste document text or drop official record here to calculate on-the-fly hash..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full bg-white border border-[#e2dfd7] text-neutral-900 p-4 rounded-2xl text-xs focus:outline-none focus:border-black font-mono shadow-2xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-3">
            <Button
              variant="default"
              size="lg"
              onClick={handleVerify}
              disabled={isVerifying || (!inputHash && !textContent)}
              className="h-12 px-7 gap-2 shadow-md bg-black text-white hover:bg-neutral-800 font-bold rounded-full"
            >
              <Search className="w-4 h-4 text-[#ea4242]" />
              {isVerifying ? 'Cross-referencing WORM Vault...' : 'Run Courtroom Admissibility Verification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Verdict Result Display */}
      {result && (
        <Card
          className={`border transition-all rounded-[32px] p-8 shadow-md ${
            result.verified
              ? 'border-2 border-black bg-white text-neutral-900'
              : 'border-2 border-[#ea4242] bg-[#ea4242] text-white shadow-2xl'
          }`}
        >
          <div className="space-y-6">
            {/* Header Stamp */}
            <div className={`flex items-center justify-between border-b pb-5 ${result.verified ? 'border-[#f1eee8]' : 'border-white/20'}`}>
              <div className="flex items-center gap-4">
                {result.verified ? (
                  <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                    <Check className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-white text-[#ea4242] flex items-center justify-center shadow-lg animate-bounce">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <div className={`text-xs uppercase tracking-wider font-extrabold ${result.verified ? 'text-neutral-400' : 'text-white/80'}`}>
                    Judicial Authenticity Certification Verdict
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-tight mt-0.5">
                    {result.verdict.replace(/_/g, ' ')}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <Badge variant={result.verified ? 'solid' : 'secondary'} className={`text-xs px-4 py-1.5 font-bold ${result.verified ? 'bg-black text-white' : 'bg-white text-[#ea4242]'}`}>
                  {result.confidence || (result.verified ? '100% CRYPTOGRAPHIC MATCH' : '0% MATCH')}
                </Badge>
              </div>
            </div>

            {/* Verdict Body */}
            {result.verified ? (
              <div className="space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 border border-[#e8e5df] bg-[#f6f4f1]/70 rounded-[24px]">
                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] block font-bold">Verified Exhibit Title</span>
                    <span className="text-neutral-900 font-bold text-base mt-0.5 block">{result.document?.title}</span>
                    <span className="text-neutral-500 block text-xs mt-1">
                      Doc ID: {result.document?.doc_id} • Type: {result.document?.doc_type}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] block font-bold">Linked Case Docket</span>
                    <span className="text-neutral-900 font-bold text-base mt-0.5 block">
                      {result.case_details?.case_number}
                    </span>
                    <span className="text-neutral-500 block text-xs mt-1">
                      {result.case_details?.title}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] block font-bold">Original Ingestion Point</span>
                    <span className="text-neutral-900 font-semibold text-xs mt-0.5 block">
                      {result.document?.created_by} ({result.case_details?.station})
                    </span>
                    <span className="text-neutral-400 block text-[11px] font-mono mt-0.5">
                      Timestamp: {formatDate(result.document?.created_at || '')}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 uppercase text-[10px] block font-bold">BSA 2023 Sec 63 Certification</span>
                    <span className="text-neutral-900 font-bold flex items-center gap-1.5 text-xs mt-0.5">
                      <Award className="w-4 h-4 text-[#ea4242]" />
                      {result.bsa_certificate ? 'DUAL-SIGNED & ADMISSIBLE' : 'PENDING CO-SIGNATURE'}
                    </span>
                    <span className="text-neutral-500 block text-[11px] mt-0.5">
                      Chain of Custody Events: {result.ledger_history_count} Verified Touchpoints
                    </span>
                  </div>
                </div>

                <div className="p-5 border border-[#e8e5df] bg-white rounded-[24px] text-xs text-neutral-600 space-y-1 shadow-2xs">
                  <span className="text-neutral-900 font-bold block text-sm">Statutory Judicial Notice:</span>
                  <p className="leading-relaxed">
                    The submitted hash fingerprint matches the bit-stream recorded at the time of seizure in the police repository. Under Section 61 and Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, this electronic record is eligible for statutory admission in evidence without requiring production of the primary physical source device.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-6 border-2 border-white bg-black/40 rounded-[24px] text-white space-y-2.5">
                  <span className="font-extrabold text-base block uppercase tracking-wider">Forensic Discrepancy Alert:</span>
                  <p className="text-sm leading-relaxed text-white/95">
                    {result.message || 'The submitted document hash does not exist in the police evidence repository, or has been altered post-acquisition. The document fails evidentiary integrity standards.'}
                  </p>
                  <div className="text-xs font-mono opacity-85 pt-1">
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
