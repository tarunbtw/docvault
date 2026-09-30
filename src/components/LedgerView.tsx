import React, { useState } from 'react';
import {
  Link,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Key,
  Clock,
  User,
  Activity,
  CheckCircle,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, truncateHash } from '@/lib/utils';
import type { LedgerBlock, HealthStatus } from '@/services/api';
import type { UserRole } from './Header';

interface LedgerViewProps {
  blocks: LedgerBlock[];
  health: HealthStatus | null;
  activeRole: UserRole;
  onRefreshLedger: () => Promise<void>;
  onSimulateTamper: (blockId?: number) => Promise<void>;
  onResetVault: () => Promise<void>;
}

export function LedgerView({
  blocks,
  health,
  activeRole,
  onRefreshLedger,
  onSimulateTamper,
  onResetVault
}: LedgerViewProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isTampering, setIsTampering] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const isIntact = health?.ledger_details?.intact ?? true;
  const brokenIndex = health?.ledger_details?.brokenBlockIndex;

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleTamperClick = async () => {
    setIsTampering(true);
    try {
      await onSimulateTamper(2);
    } finally {
      setIsTampering(false);
    }
  };

  const handleResetClick = async () => {
    setIsResetting(true);
    try {
      await onResetVault();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans animate-view-fade">
      
      {/* Designer Hero Card with Abstract Blockchain Matrix Art */}
      <div className="relative bg-white border border-[#e2ded6] rounded-2xl p-7 shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Abstract Blockchain Nodes Vector Motif */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-20">
          <svg width="340" height="220" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="220" y="30" width="60" height="60" rx="16" stroke="black" strokeWidth="1.5" />
            <rect x="140" y="110" width="60" height="60" rx="16" stroke="#ea4242" strokeWidth="1.8" />
            <rect x="260" y="130" width="60" height="60" rx="16" stroke="black" strokeWidth="1.5" />
            <line x1="220" y1="60" x2="170" y2="110" stroke="#ea4242" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="200" y1="140" x2="260" y2="160" stroke="black" strokeWidth="1.5" />
            <circle cx="170" cy="110" r="4" fill="#ea4242" />
            <circle cx="200" cy="140" r="4" fill="black" />
          </svg>
        </div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs shadow-xs">
              <Link className="w-4 h-4 text-[#ea4242]" />
            </div>
            <span className="text-[10px] font-bold text-white bg-[#ea4242] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Merkle Tree Audit Enclave
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
            Cryptographic Chain of Custody Ledger
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every evidentiary touchpoint (ingest, inspect, redact, sign, verify) recorded in a tamper-evident Merkle hash chain with RSA-2048 PKI digital signatures.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              {blocks.length} Cryptographic Blocks
            </span>
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              NIST SHA-256 Chained
            </span>
            <span className="text-xs font-bold font-mono bg-black text-white px-3 py-1 rounded-xl border border-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ea4242]" /> ZERO TAMPER GUARANTEE
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="outline"
            size="default"
            onClick={onRefreshLedger}
            className="h-11 px-4 gap-2 font-bold text-xs rounded-xl border-[#e2ded6] bg-white hover:bg-[#ece8e1] text-neutral-800"
          >
            <RefreshCw className="w-4 h-4" />
            Re-verify
          </Button>

          <Button
            variant="destructive"
            size="default"
            onClick={handleTamperClick}
            disabled={isTampering}
            className="h-11 px-4 gap-2 font-bold text-xs bg-[#ea4242] hover:bg-[#d43838] text-white rounded-xl shadow-xs shrink-0"
            title="Demonstrate how the system catches unauthorized database tampering"
          >
            <AlertTriangle className="w-4 h-4" />
            {isTampering ? 'Testing...' : 'Simulate Tamper (Block #2)'}
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={handleResetClick}
            disabled={isResetting}
            className="h-11 px-4 gap-2 font-bold text-xs bg-black hover:bg-neutral-800 text-white rounded-xl shadow-xs shrink-0"
          >
            <RotateCcw className="w-4 h-4 text-[#ea4242]" />
            {isResetting ? 'Restoring...' : 'Restore State'}
          </Button>
        </div>
      </div>

      {/* Integrity Status Alert Box */}
      <div
        className={`p-6 rounded-[32px] border transition-all duration-300 ${
          isIntact
            ? 'border-2 border-black bg-white text-neutral-900 shadow-sm'
            : 'border-2 border-[#ea4242] bg-[#ea4242] text-white font-semibold shadow-2xl'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {isIntact ? (
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Check className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white text-[#ea4242] flex items-center justify-center shrink-0 animate-bounce shadow-lg">
                <ShieldAlert className="w-7 h-7" />
              </div>
            )}
            <div>
              <div className="text-base font-extrabold tracking-tight">
                {isIntact
                  ? 'Cryptographic Chain Status: 100% UNBROKEN & MATHEMATICALLY VERIFIED'
                  : `CRITICAL INTEGRITY VIOLATION DETECTED AT BLOCK #${brokenIndex}!`}
              </div>
              <p className={isIntact ? 'text-neutral-500 text-xs mt-1 font-medium' : 'text-white/90 text-xs mt-1 font-medium'}>
                {health?.ledger_details?.reason || 'All block hashes mathematically align with NIST FIPS 180-4 SHA-256 criteria.'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`block text-[11px] uppercase font-bold tracking-wider ${isIntact ? 'text-neutral-400' : 'text-white/80'}`}>
              Total Verified Blocks
            </span>
            <span className="text-3xl font-extrabold font-mono">{blocks.length}</span>
          </div>
        </div>
      </div>

      {/* Chronological Blocks Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
          <span>Chronological Merkle Ledger Entries (Block #1 to #{blocks.length})</span>
          <span className="text-[11px] text-neutral-400 font-mono">Linked with SHA-256</span>
        </div>

        <div className="space-y-4">
          {blocks.map((block) => {
            const isBrokenBlock = !isIntact && brokenIndex === block.block_id;
            let detailsObj: any = {};
            try {
              detailsObj = JSON.parse(block.details_json);
            } catch {
              detailsObj = { raw: block.details_json };
            }

            return (
              <Card
                key={block.block_id}
                className={`transition-all bg-white rounded-[32px] p-7 shadow-sm ${
                  isBrokenBlock
                    ? 'border-2 border-[#ea4242] shadow-xl'
                    : 'border-[#e8e5df] hover:border-black/30'
                }`}
              >
                <div className="space-y-5">
                  {/* Block Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1eee8] pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`font-mono text-xs font-extrabold px-3.5 py-1 rounded-full border ${
                        isBrokenBlock ? 'bg-[#ea4242] text-white border-[#ea4242]' : 'bg-[#f6f4f1] text-neutral-900 border-[#e8e5df]'
                      }`}>
                        BLOCK #{block.block_id}
                      </span>
                      <Badge variant={isBrokenBlock ? 'warning' : 'solid'} className="text-xs font-bold">
                        {block.action}
                      </Badge>
                      {block.doc_id && (
                        <span className="text-neutral-500 text-xs font-mono font-medium">
                          Doc: {block.doc_id}
                        </span>
                      )}
                      {block.case_id && (
                        <span className="text-neutral-400 text-xs font-mono">
                          ({block.case_id})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-neutral-400 text-xs font-mono">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(block.timestamp)}</span>
                    </div>
                  </div>

                  {/* Actor & Action Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-[#f6f4f1]/70 border border-[#e8e5df] rounded-[24px] text-xs">
                    <div>
                      <span className="text-neutral-400 text-[10px] block uppercase font-bold">Custodial Signatory</span>
                      <span className="text-neutral-900 font-bold text-sm block mt-0.5">{block.actor_name}</span>
                      <span className="text-neutral-500 block text-xs mt-0.5">{block.actor_role} ({block.actor_id})</span>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-neutral-400 text-[10px] block uppercase font-bold">Action Payload & Audit Context</span>
                      <div className="text-neutral-700 space-y-1 mt-1 font-mono text-xs">
                        {Object.entries(detailsObj).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <strong className="text-neutral-500">{k}:</strong> {String(v)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Linkage Hashes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1 border-t border-[#f1eee8]">
                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Previous Block Hash:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-neutral-600 bg-[#f6f4f1] border border-[#e8e5df] px-3 py-1.5 rounded-xl break-all font-mono text-xs">
                          {block.previous_hash}
                        </code>
                        <button
                          onClick={() => handleCopy(block.previous_hash)}
                          className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
                          title="Copy previous hash"
                        >
                          {copiedHash === block.previous_hash ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase font-bold block mb-1">Current Block Hash (SHA-256):</span>
                      <div className="flex items-center gap-2">
                        <code className="text-neutral-900 font-bold bg-[#f6f4f1] border border-[#e8e5df] px-3 py-1.5 rounded-xl break-all font-mono text-xs">
                          {block.block_hash}
                        </code>
                        <button
                          onClick={() => handleCopy(block.block_hash)}
                          className="text-neutral-400 hover:text-black p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
                          title="Copy current block hash"
                        >
                          {copiedHash === block.block_hash ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature */}
                  <div className="text-xs text-neutral-400 flex items-center justify-between pt-1">
                    <span className="flex items-center gap-2 font-mono">
                      <Key className="w-4 h-4 text-[#ea4242]" />
                      PKI Digital Signature: {truncateHash(block.digital_signature, 16, 12)}
                    </span>
                    <span className="text-neutral-700 font-bold font-mono text-xs">
                      RSA-2048 / SHA-256 Attestation
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
