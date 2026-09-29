import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Copy,
  Check,
  Award,
  Download,
  AlertCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate, truncateHash } from '@/lib/utils';
import type { DocumentItem } from '@/services/api';
import type { UserRole } from './Header';

interface DocumentViewerModalProps {
  document: DocumentItem | null;
  activeRole: UserRole;
  onClose: () => void;
  onRedact: (docId: string, redactedContent: string, reason: string) => Promise<void>;
  onGenerateCert?: (docId: string) => void;
}

export function DocumentViewerModal({
  document,
  activeRole,
  onClose,
  onRedact,
  onGenerateCert
}: DocumentViewerModalProps) {
  const [copiedHash, setCopiedHash] = useState<'sha256' | 'sha512' | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'original' | 'redacted'>('original');
  const [isRedacting, setIsRedacting] = useState(false);
  const [redactionReason, setRedactionReason] = useState('Masking sensitive personal identifiers pursuant to Section 228A IPC and POCSO Act 2012');
  const [timestampNow, setTimestampNow] = useState(new Date().toUTCString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestampNow(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!document) return null;

  const hasRedactedVersion = document.is_redacted === 1 && !!document.redacted_content;
  const currentContent = activeViewMode === 'redacted' && hasRedactedVersion
    ? document.redacted_content!
    : document.raw_content;

  const handleCopy = (type: 'sha256' | 'sha512', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(type);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleApplyRedaction = async () => {
    setIsRedacting(true);
    try {
      const lines = document.raw_content.split('\n');
      const redactedLines = lines.map(line => {
        if (
          line.toLowerCase().includes('complainant:') ||
          line.toLowerCase().includes('witness') ||
          line.toLowerCase().includes('address:') ||
          line.toLowerCase().includes('victim')
        ) {
          return `████████ [REDACTED PURSUANT TO SECTION 228A IPC & SECTION 74 JUVENILE JUSTICE ACT - AUDITED BY ${activeRole.badge}] ████████`;
        }
        return line;
      });

      const redactedText = redactedLines.join('\n');
      await onRedact(document.doc_id, redactedText, redactionReason);
      setActiveViewMode('redacted');
    } catch (err) {
      console.error('Failed to apply redaction:', err);
    } finally {
      setIsRedacting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-7">
      <div className="bg-white border border-[#e2ded6] w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Top Control Bar */}
        <div className="border-b border-[#ece8e1] bg-white px-7 py-4 flex items-center justify-between relative overflow-hidden">
          {/* Subtle Abstract Background Accent */}
          <div className="absolute right-32 top-0 bottom-0 w-64 pointer-events-none opacity-20">
            <svg viewBox="0 0 200 80" className="w-full h-full stroke-neutral-400 fill-none" strokeWidth="1">
              <circle cx="100" cy="40" r="30" strokeDasharray="3 3" />
              <circle cx="100" cy="40" r="55" />
              <line x1="20" y1="40" x2="180" y2="40" />
            </svg>
          </div>

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5 text-[#ea4242]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  {document.title}
                </h2>
                <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-semibold rounded-md">
                  {document.doc_type}
                </Badge>
                {document.is_redacted === 1 && (
                  <Badge variant="solid" className="text-xs bg-[#ea4242] text-white px-2.5 py-0.5 rounded-md font-semibold">
                    REDACTED DISCOVERY
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-2">
                <span>Doc ID: <strong className="text-neutral-800">{document.doc_id}</strong></span>
                <span>•</span>
                <span>File: {document.file_name}</span>
                <span>•</span>
                <span>{(document.file_size / 1024).toFixed(1)} KB</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            {onGenerateCert && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateCert(document.doc_id)}
                className="gap-2 rounded-xl border-[#e2ded6] text-xs font-semibold px-3.5"
              >
                <Award className="w-4 h-4 text-[#ea4242]" />
                BSA Sec 63 Cert
              </Button>
            )}

            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-black w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#ece8e1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cryptographic Hash Bar */}
        <div className="bg-[#f6f4f1] border-b border-[#e8e5df] px-7 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="text-neutral-500 uppercase font-semibold text-[11px] tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#ea4242]" />
                SHA-256 Fingerprint:
              </span>
              <code className="text-neutral-900 font-mono font-semibold bg-white border border-[#e8e5df] px-3 py-1 rounded-xl text-xs shadow-2xs">
                {truncateHash(document.sha256_hash, 18, 14)}
              </code>
              <button
                onClick={() => handleCopy('sha256', document.sha256_hash)}
                className="text-neutral-400 hover:text-black p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#e8e5df] cursor-pointer transition-colors"
                title="Copy Full SHA-256"
              >
                {copiedHash === 'sha256' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-neutral-600 text-xs">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>WORM Immutable Storage Preserved</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-xs mr-1 font-semibold">VIEW:</span>
            <Button
              variant={activeViewMode === 'original' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveViewMode('original')}
              className="rounded-full text-xs font-semibold px-4"
            >
              Master Original
            </Button>
            {hasRedactedVersion && (
              <Button
                variant={activeViewMode === 'redacted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveViewMode('redacted')}
                className="rounded-full text-xs font-semibold px-4"
              >
                Redacted Discovery
              </Button>
            )}
          </div>
        </div>

        {/* Center Workspace: Document Body with Forensic Dynamic Watermark */}
        <div className="flex-1 relative overflow-hidden bg-white flex flex-col md:flex-row">
          {/* Main Document Text Area with Forensic Watermark Canvas */}
          <div className="flex-1 overflow-y-auto p-7 font-mono text-xs text-neutral-800 leading-relaxed relative select-text border-r border-[#f1eee8]">
            {/* Dynamic Forensic Watermark Overlay */}
            <div
              className="absolute inset-0 pointer-events-none flex flex-col justify-around items-center opacity-[0.05] overflow-hidden select-none z-10"
              style={{ transform: 'rotate(-25deg)', transformOrigin: 'center' }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="text-center font-bold tracking-widest text-sm text-neutral-900 whitespace-nowrap">
                  CONFIDENTIAL • POLICE USE ONLY • OFFICER: {activeRole.name} • BADGE: {activeRole.badge} • IP: 10.42.18.9 • {timestampNow}
                </div>
              ))}
            </div>

            {/* Document Content Box */}
            <div className="relative z-20 whitespace-pre-wrap font-mono leading-7 bg-[#f6f4f1]/60 p-7 border border-[#e8e5df] rounded-[24px] shadow-2xs text-[13px]">
              {currentContent}
            </div>
          </div>

          {/* Right Inspection & Redaction Sidebar */}
          <div className="w-full md:w-88 bg-[#f6f4f1]/40 p-6 overflow-y-auto flex flex-col gap-5 text-xs">
            {/* Ingestion & Custody Metadata */}
            <Card className="bg-white border-[#e8e5df] rounded-[24px] p-5 shadow-2xs">
              <div className="font-semibold text-neutral-900 uppercase tracking-wider text-xs flex items-center gap-2 pb-3 mb-3 border-b border-[#f1eee8]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Custody Attestation
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 text-[10px] block font-semibold uppercase tracking-wider">Uploaded By:</span>
                  <span className="text-neutral-900 font-semibold text-xs">{document.created_by}</span>
                  <span className="text-neutral-500 block text-[11px]">{document.uploader_role}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] block font-semibold uppercase tracking-wider">Ingestion Timestamp:</span>
                  <span className="text-neutral-800 font-mono text-[11px]">{formatDate(document.created_at)}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] block font-semibold uppercase tracking-wider">Integrity State:</span>
                  <span className="text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full inline-block mt-1 border border-emerald-100 text-[11px]">
                    Bit-stream preserved (WORM)
                  </span>
                </div>
              </div>
            </Card>

            {/* Redaction Studio */}
            <Card className="bg-white border-[#e8e5df] rounded-[24px] p-5 shadow-2xs">
              <div className="font-semibold text-neutral-900 uppercase tracking-wider text-xs flex items-center gap-2 pb-3 mb-3 border-b border-[#f1eee8]">
                <Lock className="w-4 h-4 text-[#ea4242]" />
                Statutory Redaction Studio
              </div>
              <div className="space-y-3.5 text-xs">
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Apply legally mandated identity protection for minor victims, witnesses, and sensitive financial credentials under Sec 228A IPC & POCSO Act.
                </p>

                <div>
                  <label className="text-neutral-600 text-[10px] block mb-1.5 font-semibold uppercase tracking-wider">Audit Justification:</label>
                  <textarea
                    value={redactionReason}
                    onChange={(e) => setRedactionReason(e.target.value)}
                    rows={2}
                    className="w-full bg-[#f6f4f1] border border-[#e8e5df] text-neutral-900 p-2.5 rounded-xl text-xs focus:outline-none focus:border-black font-sans resize-none"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyRedaction}
                  disabled={isRedacting}
                  className="w-full justify-center text-xs font-semibold rounded-full border-[#e8e5df] hover:border-black py-2.5 h-auto"
                >
                  {isRedacting ? 'Applying Mask & Audit...' : 'Auto-Mask PII / POCSO Identifiers'}
                </Button>

                {document.is_redacted === 1 && (
                  <div className="p-3 border border-emerald-100 bg-emerald-50 rounded-2xl text-[11px] text-emerald-800">
                    <span className="font-semibold block mb-0.5">Redaction Recorded</span>
                    Mask layer signed & committed to Merkle ledger with audit reason.
                  </div>
                )}
              </div>
            </Card>

            {/* Forensic Watermark Notice */}
            <div className="border border-[#e8e5df] p-4 rounded-[24px] bg-white text-[11px] text-neutral-500 space-y-1.5 shadow-2xs">
              <span className="text-neutral-900 font-semibold uppercase block flex items-center gap-1.5 text-xs tracking-wider">
                <Eye className="w-4 h-4 text-[#ea4242]" />
                Anti-Leak Forensic Watermark
              </span>
              <p className="leading-relaxed">
                Dynamic diagonal watermarks are currently active on this viewport. Unauthorized screen captures are traceable to officer badge <strong className="text-neutral-900">{activeRole.badge}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#ece8e1] bg-white px-7 py-3.5 flex items-center justify-between text-xs text-neutral-600">
          <span>Active Forensic Session: <strong className="text-neutral-900">{activeRole.name}</strong> ({activeRole.badge})</span>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy('sha256', document.sha256_hash)}
              className="gap-2 rounded-xl border-[#e2ded6] font-semibold text-xs px-3.5"
            >
              <Copy className="w-4 h-4" />
              Copy SHA-256
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="rounded-xl bg-black text-white hover:bg-neutral-800 font-semibold text-xs px-4"
            >
              Close Viewer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
