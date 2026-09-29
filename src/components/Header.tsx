import React from 'react';
import { ShieldCheck, Scale, AlertTriangle, RefreshCw, UserCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HealthStatus } from '@/services/api';

export interface UserRole {
  id: string;
  name: string;
  role: string;
  badge: string;
  station: string;
}

export const USER_ROLES: UserRole[] = [
  {
    id: 'IO-DL-44821',
    name: 'Inspector Vikramaditya Sharma',
    role: 'Investigating Officer (IO)',
    badge: 'DL-CP-44821',
    station: 'Cyber Crime PS Central, New Delhi'
  },
  {
    id: 'SHO-DL-0012',
    name: 'ACP K.K. Rao',
    role: 'Station House Officer (SHO)',
    badge: 'DL-ACP-0012',
    station: 'Cyber Crime PS Central, New Delhi'
  },
  {
    id: 'FSL-EXP-884',
    name: 'Dr. Ananya Sen',
    role: 'Forensic Expert (FSL)',
    badge: 'FSL-DEL-SSO-884',
    station: 'Forensic Science Laboratory, Rohini'
  },
  {
    id: 'PROS-DEL-331',
    name: 'Adv. M.K. Srivastava',
    role: 'Public Prosecutor',
    badge: 'DL-PP-331',
    station: 'Tis Hazari District Courts'
  },
  {
    id: 'JUDGE-TH-902',
    name: 'Hon. Arvind K. Grover (CMM)',
    role: 'Judicial Magistrate / Judge',
    badge: 'DHJS-902',
    station: 'Chief Metropolitan Magistrate Court, Tis Hazari'
  },
  {
    id: 'AUDIT-VIG-101',
    name: 'Director S. Ramanathan',
    role: 'Compliance & Vigilance Auditor',
    badge: 'MHA-VIG-101',
    station: 'Ministry of Home Affairs'
  }
];

interface HeaderProps {
  health: HealthStatus | null;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onRefreshHealth: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({
  health,
  activeRole,
  onRoleChange,
  onRefreshHealth,
  activeTab,
  onTabChange
}: HeaderProps) {
  const isLedgerIntact = health?.ledger_details?.intact ?? true;

  return (
    <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-40">
      {/* Top Gazette / Department Banner */}
      <div className="border-b border-neutral-900 bg-neutral-900/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-neutral-200 uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5 text-neutral-300" />
            National Criminal Justice & Digital Evidence Repository
          </span>
          <span className="hidden md:inline text-neutral-600">|</span>
          <span className="hidden md:inline text-neutral-400">
            Statutory Compliance: Bharatiya Sakshya Adhiniyam (BSA), 2023 (Sec 63)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isLedgerIntact ? (
            <Badge variant="outline" className="border-neutral-700 text-neutral-300 gap-1 bg-neutral-900">
              <ShieldCheck className="w-3 h-3 text-white" />
              Merkle Ledger Verified (Block Count: {health?.ledger_details?.blockCount ?? '...'})
            </Badge>
          ) : (
            <Badge variant="warning" className="border-white bg-white text-black font-bold animate-pulse gap-1">
              <ShieldAlert className="w-3 h-3 text-black" />
              TAMPER DETECTED AT BLOCK #{health?.ledger_details?.brokenBlockIndex}
            </Badge>
          )}

          <button
            onClick={onRefreshHealth}
            title="Re-verify System Integrity"
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo and Seal */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-neutral-700 bg-neutral-900 flex items-center justify-center rounded-xs shadow-inner">
            <Scale className="w-5 h-5 text-neutral-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider uppercase font-serif text-white">
                LEXIS-VAULT
              </h1>
              <span className="text-[10px] font-mono border border-neutral-700 px-1.5 py-0.2 rounded-xs bg-neutral-900 text-neutral-300">
                v2.4-PROD
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono tracking-tight">
              Cryptographic Document Management & Evidence Integrity System
            </p>
          </div>
        </div>

        {/* Role & Session Switcher */}
        <div className="flex items-center gap-2 border border-neutral-800 bg-neutral-900/80 p-1 rounded-sm">
          <div className="flex items-center gap-2 px-2 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
              Acting As:
            </span>
          </div>

          <select
            value={activeRole.id}
            onChange={(e) => {
              const selected = USER_ROLES.find(r => r.id === e.target.value);
              if (selected) onRoleChange(selected);
            }}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-neutral-500 font-mono cursor-pointer"
          >
            {USER_ROLES.map((r) => (
              <option key={r.id} value={r.id} className="bg-neutral-950 text-neutral-100">
                {r.role} • {r.name}
              </option>
            ))}
          </select>

          <div className="hidden lg:flex flex-col text-[10px] font-mono border-l border-neutral-800 pl-2 pr-1 text-neutral-400">
            <span>Badge: <strong className="text-neutral-200">{activeRole.badge}</strong></span>
            <span className="truncate max-w-[170px]" title={activeRole.station}>{activeRole.station}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-t border-neutral-900 flex overflow-x-auto gap-1">
        {[
          { id: 'cases', label: 'Case Dossiers' },
          { id: 'vault', label: 'WORM Evidence Vault' },
          { id: 'certificates', label: 'BSA 2023 Sec 63 Certificates' },
          { id: 'ledger', label: 'Chain of Custody (Ledger)' },
          { id: 'verify', label: 'Courtroom Verifier' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-white text-white bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
