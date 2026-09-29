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
  Check
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
    <div className="space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
            <Link className="w-5 h-5 text-neutral-300" />
            Immutable Cryptographic Chain of Custody (Ledger)
          </h2>
          <p className="text-xs text-neutral-400 font-mono">
            Every evidentiary touchpoint (ingest, inspect, redact, sign, verify) recorded in a tamper-evident Merkle hash chain
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshLedger}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-verify Chain
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleTamperClick}
            disabled={isTampering}
            className="gap-1.5 text-neutral-200"
            title="Demonstrate how the system catches unauthorized database tampering"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />
            {isTampering ? 'Simulating...' : 'Simulate Tamper (Block #2)'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetClick}
            disabled={isResetting}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isResetting ? 'Restoring...' : 'Restore Pristine State'}
          </Button>
        </div>
      </div>

      {/* Integrity Status Alert Box */}
      <div
        className={`p-4 rounded-sm border font-mono text-xs transition-all ${
          isIntact
            ? 'border-neutral-700 bg-neutral-900/60 text-neutral-200'
            : 'border-white bg-white text-black font-semibold shadow-2xl'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isIntact ? (
              <ShieldCheck className="w-6 h-6 text-neutral-200 shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-black shrink-0 animate-bounce" />
            )}
            <div>
              <div className="text-sm font-bold uppercase tracking-wider">
                {isIntact
                  ? 'Cryptographic Chain Status: 100% UNBROKEN & VERIFIED'
                  : `CRITICAL INTEGRITY VIOLATION DETECTED AT BLOCK #${brokenIndex}!`}
              </div>
              <p className={isIntact ? 'text-neutral-400 text-[11px] mt-0.5' : 'text-neutral-800 text-[11px] mt-0.5'}>
                {health?.ledger_details?.reason || 'All block hashes mathematically align with NIST SHA-256 criteria.'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold">Total Chained Blocks</span>
            <span className="text-base font-bold">{blocks.length}</span>
          </div>
        </div>
      </div>

      {/* Chronological Blocks Timeline */}
      <div className="space-y-4">
        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider px-1">
          Chronological Merkle Ledger Entries (Oldest to Newest)
        </div>

        <div className="space-y-3">
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
                className={`transition-all ${
                  isBrokenBlock
                    ? 'border-2 border-white bg-neutral-900 text-white'
                    : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                }`}
              >
                <div className="p-4 space-y-3 font-mono text-xs">
                  {/* Block Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-100 bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-xs text-xs">
                        BLOCK #{block.block_id}
                      </span>
                      <Badge variant="solid" className="text-[9px] bg-neutral-200 text-black">
                        {block.action}
                      </Badge>
                      {block.doc_id && (
                        <span className="text-neutral-400 text-[11px]">
                          Doc: {block.doc_id}
                        </span>
                      )}
                      {block.case_id && (
                        <span className="text-neutral-500 text-[11px]">
                          ({block.case_id})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{formatDate(block.timestamp)}</span>
                    </div>
                  </div>

                  {/* Actor & Action Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-neutral-900/30 border border-neutral-900 rounded-xs text-[11px]">
                    <div>
                      <span className="text-neutral-500 text-[10px] block uppercase">Custodial Actor</span>
                      <span className="text-neutral-200 font-semibold">{block.actor_name}</span>
                      <span className="text-neutral-400 block text-[10px]">{block.actor_role} ({block.actor_id})</span>
                    </div>

                    <div className="md:col-span-2">
                      <span className="text-neutral-500 text-[10px] block uppercase">Action Payload & Audit Context</span>
                      <div className="text-neutral-300 space-y-0.5 mt-0.5 text-[10px]">
                        {Object.entries(detailsObj).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <strong className="text-neutral-400">{k}:</strong> {String(v)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic Linkage Hashes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] pt-1 border-t border-neutral-900">
                    <div>
                      <span className="text-neutral-500 block uppercase mb-0.5">Previous Block Hash:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-xs break-all">
                          {block.previous_hash}
                        </code>
                        <button
                          onClick={() => handleCopy(block.previous_hash)}
                          className="text-neutral-500 hover:text-white p-0.5 cursor-pointer"
                        >
                          {copiedHash === block.previous_hash ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-500 block uppercase mb-0.5">Current Block Hash (SHA-256):</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-neutral-200 font-semibold bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-xs break-all">
                          {block.block_hash}
                        </code>
                        <button
                          onClick={() => handleCopy(block.block_hash)}
                          className="text-neutral-500 hover:text-white p-0.5 cursor-pointer"
                        >
                          {copiedHash === block.block_hash ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature */}
                  <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-neutral-400" />
                      PKI Digital Signature: {truncateHash(block.digital_signature, 14, 10)}
                    </span>
                    <span className="text-neutral-400 font-semibold">
                      RSA-2048 / SHA-256
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
