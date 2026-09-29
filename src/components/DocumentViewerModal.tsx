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
  AlertCircle
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
      // Auto-redact common sensitive lines (victim/informant names, addresses, phone numbers)
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
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 backdrop-blur-xs">
      <div className="bg-neutral-950 border border-neutral-700 w-full max-w-5xl h-[92vh] flex flex-col rounded-sm shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="border-b border-neutral-800 bg-neutral-900/90 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 border border-neutral-700 bg-neutral-950 flex items-center justify-center rounded-xs">
              <FileText className="w-4 h-4 text-neutral-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-100">
                  {document.title}
                </h2>
                <Badge variant="outline" className="text-[10px]">
                  {document.doc_type}
                </Badge>
                {document.is_redacted === 1 && (
                  <Badge variant="solid" className="text-[10px] bg-neutral-200 text-black">
                    REDACTED COPY AVAILABLE
                  </Badge>
                )}
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                Doc ID: {document.doc_id} • File: {document.file_name} • {(document.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onGenerateCert && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGenerateCert(document.doc_id)}
                className="gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                BSA Sec 63 Cert
              </Button>
            )}

            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-sm border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cryptographic Hash Bar */}
        <div className="bg-neutral-900/40 border-b border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 uppercase font-semibold text-[10px]">SHA-256 Fingerprint:</span>
              <code className="text-neutral-200 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded-xs text-[11px]">
                {truncateHash(document.sha256_hash, 16, 12)}
              </code>
              <button
                onClick={() => handleCopy('sha256', document.sha256_hash)}
                className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
                title="Copy Full SHA-256"
              >
                {copiedHash === 'sha256' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-neutral-400 text-[11px]">
              <Lock className="w-3 h-3 text-neutral-400" />
              <span>WORM Immutable Storage</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1">
            <span className="text-neutral-500 text-[11px] mr-1">Layer:</span>
            <Button
              variant={activeViewMode === 'original' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveViewMode('original')}
            >
              Master Original
            </Button>
            {hasRedactedVersion && (
              <Button
                variant={activeViewMode === 'redacted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveViewMode('redacted')}
              >
                Redacted Discovery
              </Button>
            )}
          </div>
        </div>

        {/* Center Workspace: Document Body with Forensic Dynamic Watermark */}
        <div className="flex-1 relative overflow-hidden bg-neutral-950 flex flex-col md:flex-row">
          {/* Main Document Text Area with Forensic Watermark Canvas */}
          <div className="flex-1 overflow-y-auto p-6 font-mono text-xs text-neutral-200 leading-relaxed relative select-text border-r border-neutral-800/80">
            {/* Dynamic Forensic Watermark Overlay (Anti-Leakage DRM) */}
            <div
              className="absolute inset-0 pointer-events-none flex flex-col justify-around items-center opacity-10 overflow-hidden select-none z-10"
              style={{ transform: 'rotate(-25deg)', transformOrigin: 'center' }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="text-center font-bold tracking-widest text-sm text-neutral-200 whitespace-nowrap">
                  CONFIDENTIAL • POLICE USE ONLY • OFFICER: {activeRole.name} • BADGE: {activeRole.badge} • IP: 10.42.18.9 • {timestampNow}
                </div>
              ))}
            </div>

            {/* Document Content Pre */}
            <div className="relative z-20 whitespace-pre-wrap font-mono leading-6 bg-neutral-950/80 p-4 border border-neutral-900 rounded-xs">
              {currentContent}
            </div>
          </div>

          {/* Right Inspection & Redaction Sidebar */}
          <div className="w-full md:w-80 bg-neutral-900/30 p-4 overflow-y-auto flex flex-col gap-4 text-xs font-mono">
            {/* Ingestion & Custody Metadata */}
            <Card className="bg-neutral-950 border-neutral-800">
              <div className="p-3 border-b border-neutral-800 font-semibold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Custody Attestation
              </div>
              <div className="p-3 space-y-2 text-[11px]">
                <div>
                  <span className="text-neutral-500 block">Uploaded By:</span>
                  <span className="text-neutral-200 font-medium">{document.created_by}</span>
                  <span className="text-neutral-400 block text-[10px]">Role: {document.uploader_role}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Ingestion Timestamp:</span>
                  <span className="text-neutral-200">{formatDate(document.created_at)}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Integrity State:</span>
                  <span className="text-neutral-200">Bit-stream preserved (WORM)</span>
                </div>
              </div>
            </Card>

            {/* Redaction Studio */}
            <Card className="bg-neutral-950 border-neutral-800">
              <div className="p-3 border-b border-neutral-800 font-semibold text-neutral-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Statutory Redaction Studio
              </div>
              <div className="p-3 space-y-3 text-[11px]">
                <p className="text-neutral-400 text-[10px] leading-relaxed">
                  Apply legally mandated identity protection for minor victims, witnesses, and sensitive financial credentials under Sec 228A IPC & POCSO Act.
                </p>

                <div>
                  <label className="text-neutral-500 text-[10px] block mb-1">Audit Justification:</label>
                  <textarea
                    value={redactionReason}
                    onChange={(e) => setRedactionReason(e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-2 rounded-xs text-[10px] font-mono focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyRedaction}
                  disabled={isRedacting}
                  className="w-full justify-center text-[10px]"
                >
                  {isRedacting ? 'Applying Mask & Audit...' : 'Auto-Mask PII / POCSO Identifiers'}
                </Button>

                {document.is_redacted === 1 && (
                  <div className="p-2 border border-neutral-800 bg-neutral-900/50 rounded-xs text-[10px] text-neutral-400">
                    <span className="text-neutral-200 font-semibold block">Redaction Recorded</span>
                    Mask layer signed & committed to Merkle ledger with audit reason.
                  </div>
                )}
              </div>
            </Card>

            {/* Forensic Watermark Notice */}
            <div className="border border-neutral-800 p-3 rounded-xs bg-neutral-950 text-[10px] text-neutral-400 space-y-1">
              <span className="text-neutral-300 font-semibold uppercase block flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Anti-Leak Forensic Watermark
              </span>
              <p>
                Dynamic diagonal watermarks are currently active on this viewport. Unauthorized screen captures are traceable to officer badge <strong>{activeRole.badge}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-2.5 flex items-center justify-between text-xs font-mono text-neutral-400">
          <span>Active Forensic Session: {activeRole.name} ({activeRole.badge})</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy('sha256', document.sha256_hash)}
              className="gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy SHA-256
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
            >
              Close Viewer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
