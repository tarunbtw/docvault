import React, { useState } from 'react';
import {
  Bell,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Scale,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import type { HealthStatus } from '@/services/api';

export interface UserRole {
  id: string;
  name: string;
  role: string;
  badge: string;
  station: string;
  avatar?: string;
}

export const USER_ROLES: UserRole[] = [
  {
    id: 'IO-DL-44821',
    name: 'Inspector Vikramaditya Sharma',
    role: 'Investigating Officer (IO)',
    badge: 'DL-CP-44821',
    station: 'Cyber Crime PS Central, New Delhi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
  },
  {
    id: 'SHO-DL-0012',
    name: 'ACP K.K. Rao',
    role: 'Station House Officer (SHO)',
    badge: 'DL-ACP-0012',
    station: 'Cyber Crime PS Central, New Delhi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80'
  },
  {
    id: 'FSL-EXP-884',
    name: 'Dr. Ananya Sen',
    role: 'Forensic Expert (FSL)',
    badge: 'FSL-DEL-SSO-884',
    station: 'Forensic Science Laboratory, Rohini',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROS-DEL-331',
    name: 'Adv. M.K. Srivastava',
    role: 'Public Prosecutor',
    badge: 'DL-PP-331',
    station: 'Tis Hazari District Courts',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80'
  },
  {
    id: 'JUDGE-TH-902',
    name: 'Hon. Arvind K. Grover (CMM)',
    role: 'Judicial Magistrate / Judge',
    badge: 'DHJS-902',
    station: 'Chief Metropolitan Magistrate Court, Tis Hazari',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&auto=format&fit=crop&q=80'
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
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isLedgerIntact = health?.ledger_details?.intact ?? true;

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'cases', label: 'Case Dossiers' },
    { id: 'vault', label: 'Evidence Vault' },
    { id: 'certificates', label: 'BSA §63 Certificates' },
    { id: 'ledger', label: 'Chain of Custody' },
    { id: 'verify', label: 'Courtroom Verifier' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f6f4f1] border-b border-[#e2ded6] transition-all font-sans">
      <div className="w-full px-6 sm:px-10 lg:px-12 h-22 flex items-center justify-between gap-6">
        
        {/* Brand Logo with Solid Red Emblem */}
        <div 
          onClick={() => onTabChange('overview')}
          className="flex items-center gap-3.5 cursor-pointer group shrink-0"
        >
          {/* Circular Red Emblem with stylized loop (#ea4242) */}
          <div className="w-11 h-11 rounded-full bg-[#ea4242] flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 17c-3.87 0-7-3.13-7-7 0-3.08 1.99-5.71 4.79-6.65.41-.14.85.12.85.56v.48c0 .28-.18.52-.45.61-2.07.69-3.55 2.65-3.55 4.97 0 2.89 2.34 5.23 5.23s5.23-2.34 5.23-5.23c0-.49-.07-.96-.2-1.4-.08-.27.06-.56.33-.64l.46-.14c.42-.13.86.15.93.58.18.51.27 1.05.27 1.6 0 3.87-3.13 7-7 7z"
                fill="white"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
                docvault
              </span>
              <span className="text-[10px] font-bold text-white bg-[#ea4242] px-2 py-0.5 rounded-md uppercase tracking-wider">
                BSA 2023
              </span>
            </div>
          </div>
        </div>

        {/* Center Rectangle Navigation Bar with rounded edges */}
        <nav className="hidden lg:flex items-center bg-transparent">
          <div className="flex items-center p-1 gap-1.5 bg-[#ece8e1] border border-[#e2ded6] rounded-2xl">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-700 hover:text-black hover:bg-[#dedad3]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right Section: Notification Bell + User Profile */}
        <div className="flex items-center gap-3.5">
          
          {/* Merkle Ledger Health Status Dot */}
          <button
            onClick={onRefreshHealth}
            title={isLedgerIntact ? 'WORM Cryptographic Chain 100% Intact' : 'Tamper detected in Ledger!'}
            className="hidden sm:flex items-center gap-2.5 text-xs text-neutral-700 hover:text-black py-2 px-3.5 rounded-xl border border-[#e2ded6] bg-white transition-all shadow-2xs cursor-pointer"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isLedgerIntact ? 'bg-black' : 'bg-[#ea4242]'}`} />
            <span className="font-bold text-xs">
              {isLedgerIntact ? 'WORM Intact' : 'Tamper Alert'}
            </span>
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
          </button>

          {/* Notification Bell Icon */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-11 h-11 rounded-xl border border-[#e2ded6] bg-white hover:bg-[#ece8e1] flex items-center justify-center text-neutral-800 transition-colors shadow-2xs cursor-pointer relative"
              title="Notifications & Evidence Alerts"
            >
              <Bell className="w-5 h-5" />
              {/* Vibrant Red Notification Dot */}
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#ea4242]" />
            </button>

            {/* Notification Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-88 bg-white border border-[#e2ded6] rounded-2xl p-5 shadow-xl z-50 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
                  <span className="text-sm font-bold text-neutral-900">Evidentiary Audit Alerts</span>
                  <span className="text-[11px] bg-[#ea4242] text-white font-bold px-2.5 py-0.5 rounded-md">
                    3 New
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#f6f4f1] border border-[#e2ded6]">
                    <p className="font-bold text-neutral-900 text-sm">BSA 2023 §63 Certificate Signed</p>
                    <p className="text-xs text-neutral-600 mt-1">Exhibit #FSL-884 co-signed by Dr. Ananya Sen with RSA-2048.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#e2ded6]">
                    <p className="font-bold text-neutral-900 text-sm">WORM Block Sealed</p>
                    <p className="text-xs text-neutral-600 mt-1">Block #{health?.ledger_details?.blockCount ?? 4} verified with SHA-256 root.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f6f4f1] border border-[#e2ded6]">
                    <p className="font-bold text-neutral-900 text-sm">Redacted Copy Generated</p>
                    <p className="text-xs text-neutral-600 mt-1">FIR #204 victim identifiers masked pursuant to Section 228A IPC.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Rectangle with rounded edges */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-3 pl-2.5 pr-3.5 py-1.5 rounded-xl border border-[#e2ded6] bg-white hover:border-black transition-all shadow-2xs cursor-pointer"
            >
              <img
                src={activeRole.avatar}
                alt={activeRole.name}
                className="w-8 h-8 rounded-lg object-cover border border-neutral-200"
              />
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-neutral-900 block leading-tight">
                  {activeRole.name.split(' ')[0]} {activeRole.name.split(' ').slice(-1)}
                </span>
                <span className="text-[10px] text-neutral-500 block leading-tight font-medium font-mono">
                  {activeRole.badge}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </button>

            {/* Role Switcher Dropdown */}
            {roleMenuOpen && (
              <div className="absolute right-0 mt-3 w-88 bg-white border border-[#e2ded6] rounded-2xl p-4 shadow-xl z-50 space-y-1.5">
                <div className="px-3 py-2 border-b border-[#f1eee8] mb-1">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Statutory Role Session
                  </p>
                  <p className="text-xs font-semibold text-neutral-800 mt-0.5">
                    Station: {activeRole.station}
                  </p>
                </div>

                {USER_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange(role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3.5 transition-colors cursor-pointer ${
                      activeRole.id === role.id
                        ? 'bg-black text-white shadow-xs'
                        : 'hover:bg-[#f6f4f1] text-neutral-900'
                    }`}
                  >
                    <img
                      src={role.avatar}
                      alt={role.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{role.name}</p>
                      <p className={`text-[11px] truncate ${activeRole.id === role.id ? 'text-white/70' : 'text-neutral-500'}`}>
                        {role.role} • {role.badge}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Nav Pills Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2.5 border-t border-[#e8e5df] gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === item.id
                ? 'bg-black text-white'
                : 'text-neutral-600 bg-white border border-[#e8e5df]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
