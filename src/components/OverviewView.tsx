import React, { useState, useRef, useEffect } from 'react';
import {
  HardDrive,
  Video,
  FileCheck2,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  FolderLock,
  Lock,
  ArrowUpRight,
  Award,
  Scale,
  Copy,
  Check,
  Layers,
  Hash,
  Clock,
  User,
  ShieldAlert,
  Upload,
  Zap
} from 'lucide-react';
import type { Case, DocumentItem, HealthStatus } from '@/services/api';
import type { UserRole } from './Header';

interface OverviewViewProps {
  cases: Case[];
  documents: DocumentItem[];
  health: HealthStatus | null;
  activeRole: UserRole;
  onSelectDocument: (doc: DocumentItem) => void;
  onNavigateTab: (tab: string) => void;
}

export function OverviewView({
  cases,
  documents,
  health,
  activeRole,
  onSelectDocument,
  onNavigateTab
}: OverviewViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'30days' | 'quarter' | 'year'>('30days');
  const [activeEvidenceFilter, setActiveEvidenceFilter] = useState<'all' | 'forensic' | 'certs'>('all');
  const [isCopiedKey, setIsCopiedKey] = useState(false);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const deckContainerRef = useRef<HTMLDivElement>(null);
  const lastWheelTimeRef = useRef<number>(0);

  const isIntact = health?.ledger_details?.intact ?? true;
  const totalExhibits = documents.length;
  const totalCases = cases.length;

  const handleCopyKey = () => {
    navigator.clipboard.writeText('0x89F4e62a981c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    setIsCopiedKey(true);
    setTimeout(() => setIsCopiedKey(false), 2000);
  };

  const handlePrevCase = () => {
    setActiveCaseIndex((prev) => (prev > 0 ? prev - 1 : cases.length - 1));
  };

  const handleNextCase = () => {
    setActiveCaseIndex((prev) => (prev < cases.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const el = deckContainerRef.current;
    if (!el || cases.length === 0) return;

    const handleWheelScroll = (e: WheelEvent) => {
      // Trap scroll event: prevent full browser view/window from scrolling
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      // Debounce wheel steps so one notch advances exactly one card
      if (now - lastWheelTimeRef.current < 180) return;

      if (e.deltaY > 15) {
        lastWheelTimeRef.current = now;
        setActiveCaseIndex((prev) => (prev < cases.length - 1 ? prev + 1 : 0));
      } else if (e.deltaY < -15) {
        lastWheelTimeRef.current = now;
        setActiveCaseIndex((prev) => (prev > 0 ? prev - 1 : cases.length - 1));
      }
    };

    el.addEventListener('wheel', handleWheelScroll, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelScroll);
    };
  }, [cases.length]);

  // Recent exhibits from database
  const filteredExhibits = documents.filter((doc) => {
    if (activeEvidenceFilter === 'forensic') return doc.doc_type.toLowerCase().includes('raw') || doc.doc_type.toLowerCase().includes('video');
    if (activeEvidenceFilter === 'certs') return doc.doc_type.toLowerCase().includes('certificate') || doc.doc_type.toLowerCase().includes('pdf');
    return true;
  }).slice(0, 4);

  const currentCase = cases[activeCaseIndex] || cases[0];

  return (
    <div className="space-y-7 pb-16 font-sans animate-view-fade">
      {/* Top Banner Notice for Statutory Compliance */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#e2ded6] rounded-2xl px-7 py-4 shadow-xs transition-all hover:border-black/20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#ea4242] animate-pulse-subtle" />
          <span className="text-sm font-bold text-neutral-900 tracking-tight">
            DocVault WORM Cryptographic Repository
          </span>
          <span className="hidden md:inline text-neutral-300">|</span>
          <span className="hidden md:inline text-xs text-neutral-600 font-medium">
            Statutory Admissibility under Bharatiya Sakshya Adhiniyam, 2023 (Section 63) & IT Act 2000
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-neutral-500 font-semibold">Chain of Custody:</span>
          {isIntact ? (
            <span className="font-bold text-emerald-800 flex items-center gap-2 bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition-all hover:shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% UNBROKEN
            </span>
          ) : (
            <span className="font-bold text-white bg-[#ea4242] px-3.5 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-white" /> TAMPER DETECTED AT BLOCK #{health?.ledger_details?.brokenBlockIndex}
            </span>
          )}
        </div>
      </div>

      {/* Main 3-Column Responsive Grid matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* Left Column: Interactive Stacking Case Deck BEHIND WORM Vault Master Card (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Deck Stepper Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ea4242]" />
              <span className="text-sm font-bold text-neutral-900 tracking-tight">
                Case Dossier Deck
              </span>
              <span className="text-[11px] font-mono font-bold bg-[#ece8e1] text-neutral-800 px-2.5 py-0.5 rounded-lg border border-[#e2ded6] transition-all">
                {activeCaseIndex + 1} of {cases.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevCase}
                className="w-8 h-8 rounded-xl border border-[#e2ded6] bg-white hover:bg-[#ece8e1] active:scale-95 flex items-center justify-center text-neutral-800 transition-all shadow-2xs cursor-pointer"
                title="Previous / Newer Case"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextCase}
                className="w-8 h-8 rounded-xl border border-[#e2ded6] bg-white hover:bg-[#ece8e1] active:scale-95 flex items-center justify-center text-neutral-800 transition-all shadow-2xs cursor-pointer"
                title="Next / Older Case"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Merged Case Docket Quick-Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
            {cases.map((c, idx) => {
              const isSelected = idx === activeCaseIndex;
              return (
                <button
                  key={c.case_id}
                  onClick={() => setActiveCaseIndex(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-black text-white shadow-xs scale-[1.02]'
                      : 'bg-white text-neutral-700 border border-[#e2ded6] hover:bg-[#ece8e1] hover:text-black'
                  }`}
                  title={`${c.case_number}: ${c.title}`}
                >
                  {c.case_number}
                </button>
              );
            })}
          </div>

          {/* Stacking Card Deck Container: Cases stack BEHIND the WORM Vault Master Card */}
          <div
            ref={deckContainerRef}
            className="relative select-none overscroll-contain"
          >
            {/* The Stacking Case Cards Layer (Behind WORM Vault Master Card) */}
            <div className="relative z-10 pb-4">
              {/* Peek Background Card 2 (Oldest visible) */}
              {cases.length > 2 && (
                <div
                  onClick={() => setActiveCaseIndex((activeCaseIndex + 2) % cases.length)}
                  className="bg-[#dedad3] border border-[#cfcac0] rounded-2xl p-4 shadow-xs mx-6 -mb-8 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-md hover:bg-[#d5d0c7] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-700">
                    <span className="font-bold font-mono text-[11px]">
                      {cases[(activeCaseIndex + 2) % cases.length]?.case_number}
                    </span>
                    <span className="text-[10px] text-neutral-600 truncate max-w-[140px]">
                      {cases[(activeCaseIndex + 2) % cases.length]?.title}
                    </span>
                  </div>
                </div>
              )}

              {/* Peek Background Card 1 (Intermediate older case) */}
              {cases.length > 1 && (
                <div
                  onClick={() => setActiveCaseIndex((activeCaseIndex + 1) % cases.length)}
                  className="bg-[#ebe7e0] border border-[#d6d1c7] rounded-2xl p-4 shadow-xs mx-3 -mb-8 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-md hover:bg-[#e2ddd5] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-800">
                    <span className="font-bold font-mono text-[11px]">
                      {cases[(activeCaseIndex + 1) % cases.length]?.case_number}
                    </span>
                    <span className="text-[11px] text-neutral-600 truncate max-w-[160px]">
                      {cases[(activeCaseIndex + 1) % cases.length]?.title}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-900 font-mono">
                      {cases[(activeCaseIndex + 1) % cases.length]?.documents_count || 0} Docs
                    </span>
                  </div>
                </div>
              )}

              {/* Active Foreground Case Card with Spring Stack In Motion */}
              {currentCase && (
                <div 
                  key={currentCase.case_id}
                  className="bg-white border-2 border-black rounded-2xl p-6 shadow-md transition-all duration-300 ease-out hover:shadow-xl relative z-20 animate-deck-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-neutral-900 bg-[#f6f4f1] px-3 py-1 rounded-lg border border-[#e2ded6]">
                      {currentCase.case_number}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-[#ea4242] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      ACTIVE DOSSIER
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-neutral-900 line-clamp-1 mb-2">
                    {currentCase.title}
                  </h4>

                  <div className="space-y-2 text-xs text-neutral-700 mb-4 bg-[#f6f4f1] p-3.5 rounded-xl border border-[#e2ded6]">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Sections of Law:</span>
                      <span className="font-bold text-neutral-900 truncate max-w-[190px]">{currentCase.sections_of_law}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Investigating Officer:</span>
                      <span className="font-bold text-neutral-900">{currentCase.investigating_officer}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Station:</span>
                      <span className="font-bold text-neutral-900 truncate max-w-[190px]">{currentCase.station}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#ece8e1]">
                    <span className="text-xs font-bold font-mono text-neutral-900">
                      {currentCase.documents_count || currentCase.documents?.length || 0} Sealed Exhibits
                    </span>
                    <button
                      onClick={() => onNavigateTab('cases')}
                      className="text-xs font-bold text-neutral-900 hover:text-[#ea4242] flex items-center gap-1 cursor-pointer transition-colors group"
                    >
                      Open Docket <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* WORM Vault Master Card (Sits in front / anchored at bottom of deck) */}
            <div
              onClick={handleCopyKey}
              title="Click to copy Vault Root Merkle Key"
              className="relative z-30 bg-[#ea4242] text-white rounded-2xl p-7 shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.99]"
            >
              {/* Solid Geometric Watermark Lines */}
              <div className="absolute right-0 bottom-0 pointer-events-none opacity-20">
                <svg width="220" height="190" viewBox="0 0 220 190" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="180" cy="170" r="40" stroke="white" strokeWidth="2" />
                  <circle cx="180" cy="170" r="70" stroke="white" strokeWidth="2" />
                  <circle cx="180" cy="170" r="100" stroke="white" strokeWidth="2" />
                  <circle cx="180" cy="170" r="130" stroke="white" strokeWidth="2" />
                  <line x1="50" y1="170" x2="220" y2="170" stroke="white" strokeWidth="2" />
                  <line x1="180" y1="40" x2="180" y2="200" stroke="white" strokeWidth="2" />
                </svg>
              </div>

              {/* Card Header */}
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <span className="text-xs text-white/90 font-bold uppercase tracking-wider block">
                    WORM Vault Master Anchor
                  </span>
                  <div className="text-3xl font-extrabold tracking-tight mt-1 font-sans">
                    12,245 Sealed Hashes
                  </div>
                </div>

                {/* Overlapping Dual Security Rings */}
                <div className="flex items-center -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-white/20" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-white/30" />
                </div>
              </div>

              {/* Card Bottom / Masked Root Key */}
              <div className="mt-12 flex items-center justify-between text-xs font-mono text-white relative z-10">
                <span className="tracking-widest text-sm font-semibold">0x89F4 •••• •••• 1322</span>
                <span className="text-[11px] uppercase font-sans font-extrabold tracking-wider bg-white text-black px-3 py-1 rounded-lg shadow-xs">
                  {isCopiedKey ? 'COPIED!' : 'WORM ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          {/* Fast Evidentiary Operations & Session Custody Hub */}
          <div className="bg-white border border-[#e2ded6] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-[#ece8e1]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#ea4242]" />
                <span className="text-xs font-bold text-neutral-900 tracking-tight uppercase">
                  Fast Evidentiary Actions
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live Session
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('vault')}
                className="w-full text-left p-3 rounded-xl border border-[#ece8e1] hover:border-black/40 hover:bg-[#f6f4f1] transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0 group-hover:bg-[#ea4242] transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-[#ea4242] transition-colors">
                      Ingest Electronic Evidence
                    </p>
                    <p className="text-[11px] text-neutral-500">Seal raw files into WORM storage</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('verify')}
                className="w-full text-left p-3 rounded-xl border border-[#ece8e1] hover:border-black/40 hover:bg-[#f6f4f1] transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dedad3] text-neutral-900 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-[#ea4242] transition-colors">
                      Courtroom Hash Verifier
                    </p>
                    <p className="text-[11px] text-neutral-500">Live SHA-256 integrity match</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('certificates')}
                className="w-full text-left p-3 rounded-xl border border-[#ece8e1] hover:border-black/40 hover:bg-[#f6f4f1] transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dedad3] text-neutral-900 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-[#ea4242] transition-colors">
                      Issue BSA §63 Certificate
                    </p>
                    <p className="text-[11px] text-neutral-500">Statutory admissibility report</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </button>
            </div>

            {/* Custody Chain Integrity Strip */}
            <div className="bg-[#f6f4f1] border border-[#e2ded6] rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold text-neutral-800">
                  {health?.ledger_details?.blockCount || 7} Ledger Blocks
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('ledger')}
                className="font-bold text-[11px] text-[#ea4242] hover:underline cursor-pointer flex items-center gap-1"
              >
                Audit Chain <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Center Column: Evidence Flow Spline Graph + Recent Evidence & Compact Gauge (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Top Card: Evidence Flow & Audit Spline Graph */}
          <div className="bg-white border border-[#e2ded6] rounded-2xl p-7 shadow-xs relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  Evidence Flow & Audit Velocity
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Daily cryptographic block seals & evidentiary acquisitions
                </p>
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-800 hover:text-black border border-[#e2ded6] px-3.5 py-1.5 rounded-xl bg-[#f6f4f1] transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedPeriod((p) => (p === '30days' ? 'quarter' : p === 'quarter' ? 'year' : '30days'));
                  }}
                >
                  <span>{selectedPeriod === '30days' ? 'Last 30 Days' : selectedPeriod === 'quarter' ? 'Last Quarter' : 'Year to Date'}</span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            </div>

            {/* SVG Graph Canvas (240px) */}
            <div className="relative w-full h-[230px]">
              
              {/* Peak Tooltip Badge: Crimson Red Speech Bubble (#ea4242) */}
              <div 
                className="absolute z-20 flex flex-col items-center pointer-events-none transition-all duration-300"
                style={{ left: '55%', top: '22px', transform: 'translateX(-50%)' }}
              >
                <div className="bg-[#ea4242] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center justify-center tracking-tight">
                  5,312 Hashes Sealed
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#ea4242]" />
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 540 210" preserveAspectRatio="none">
                {/* Y-Axis Labels */}
                <text x="0" y="20" className="text-[11px] fill-neutral-400 font-sans font-medium">6k</text>
                <text x="0" y="52" className="text-[11px] fill-neutral-400 font-sans font-medium">5k</text>
                <text x="0" y="84" className="text-[11px] fill-neutral-400 font-sans font-medium">4k</text>
                <text x="0" y="116" className="text-[11px] fill-neutral-400 font-sans font-medium">3k</text>
                <text x="0" y="148" className="text-[11px] fill-neutral-400 font-sans font-medium">2k</text>
                <text x="0" y="180" className="text-[11px] fill-neutral-400 font-sans font-medium">1k</text>
                <text x="0" y="205" className="text-[11px] fill-neutral-400 font-sans font-medium">0</text>

                {/* Horizontal Grid lines */}
                <line x1="30" y1="16" x2="540" y2="16" stroke="#f0ede8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="48" x2="540" y2="48" stroke="#f0ede8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="80" x2="540" y2="80" stroke="#f0ede8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="112" x2="540" y2="112" stroke="#f0ede8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="144" x2="540" y2="144" stroke="#f0ede8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="176" x2="540" y2="176" stroke="#f0ede8" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="205" x2="540" y2="205" stroke="#dedad3" strokeWidth="1" />

                {/* X-Axis Month / Date Labels */}
                <text x="40" y="222" className="text-[11px] fill-neutral-400 font-sans font-medium">01 Sep</text>
                <text x="120" y="222" className="text-[11px] fill-neutral-400 font-sans font-medium">07 Sep</text>
                <text x="200" y="222" className="text-[11px] fill-neutral-400 font-sans font-medium">14 Sep</text>
                <text x="290" y="222" className="text-[11px] fill-neutral-400 font-sans font-bold">21 Sep (Peak)</text>
                <text x="390" y="222" className="text-[11px] fill-neutral-400 font-sans font-medium">25 Sep</text>
                <text x="470" y="222" className="text-[11px] fill-neutral-400 font-sans font-medium">29 Sep</text>

                {/* Spline Area Fill */}
                <path
                  d="M 30,205 L 30,165 C 70,160 110,120 160,110 C 210,100 240,60 290,40 C 340,65 390,130 440,95 C 490,65 520,70 540,75 L 540,205 Z"
                  fill="#ea4242"
                  fillOpacity="0.08"
                />

                {/* Primary Spline Stroke Line */}
                <path
                  d="M 30,165 C 70,160 110,120 160,110 C 210,100 240,60 290,40 C 340,65 390,130 440,95 C 490,65 520,70 540,75"
                  fill="none"
                  stroke="#ea4242"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="160" cy="110" r="4.5" fill="white" stroke="#ea4242" strokeWidth="2.5" />
                <circle cx="290" cy="40" r="5.5" fill="#ea4242" stroke="white" strokeWidth="2.5" />
                <circle cx="440" cy="95" r="4.5" fill="white" stroke="#ea4242" strokeWidth="2.5" />
                <circle cx="540" cy="75" r="4.5" fill="white" stroke="#ea4242" strokeWidth="2.5" />

                {/* Dashed Indicator Line under Peak */}
                <line x1="290" y1="45" x2="290" y2="205" stroke="#ea4242" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>

          {/* Bottom Split: Recent Evidence Exhibits + Tightly Formatted Compact Integrity Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Recent Electronic Exhibits Card */}
            <div className="bg-white border border-[#e2ded6] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-[#ece8e1] pb-2">
                  <h4 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-neutral-800" />
                    Recent Sealed Exhibits
                  </h4>
                  <button
                    onClick={() => onNavigateTab('vault')}
                    className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-0.5 cursor-pointer"
                  >
                    Vault <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {filteredExhibits.length > 0 ? (
                    filteredExhibits.map((doc) => (
                      <div
                        key={doc.doc_id}
                        onClick={() => onSelectDocument(doc)}
                        className="p-2.5 rounded-xl border border-[#ece8e1] hover:border-black/30 hover:bg-[#f6f4f1] transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-bold text-neutral-900 group-hover:text-[#ea4242] transition-colors truncate">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-neutral-500 font-mono">
                            {doc.doc_id} · {(doc.file_size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-neutral-800 bg-[#ece8e1] px-2 py-0.5 rounded-md shrink-0">
                          {doc.doc_type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      No electronic exhibits ingested yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BSA §63 Admissibility & Integrity Radial Gauge (Tightly Formatted - NO BIG EMPTY GAPS) */}
            <div className="bg-white border border-[#e2ded6] rounded-2xl p-5 shadow-xs flex flex-col justify-center space-y-3">
              <div className="flex items-center justify-between border-b border-[#ece8e1] pb-2">
                <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  BSA §63 Integrity Meter
                </span>
                <span className="text-[10px] font-bold text-white bg-emerald-700 px-2 py-0.5 rounded-md">
                  VERIFIED
                </span>
              </div>

              {/* Compact Semi-circular Arc Gauge */}
              <div className="relative flex flex-col items-center justify-center pt-1">
                <svg className="w-48 h-26 overflow-visible" viewBox="0 0 200 110">
                  {/* Outer Dashed Track */}
                  <path
                    d="M 20,100 A 80,80 0 0,1 180,100"
                    fill="none"
                    stroke="#e2ded6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Active Crimson Red Progress Arc: #ea4242 filled to 100% */}
                  <path
                    d="M 22,100 A 78,78 0 0,1 178,100"
                    fill="none"
                    stroke="#ea4242"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Percentage Tick Labels */}
                  <text x="10" y="108" className="text-[10px] fill-neutral-500 font-sans font-bold">0%</text>
                  <text x="32" y="44" className="text-[10px] fill-neutral-500 font-sans font-bold">25%</text>
                  <text x="94" y="16" className="text-[10px] fill-neutral-500 font-sans font-bold">50%</text>
                  <text x="156" y="44" className="text-[10px] fill-neutral-500 font-sans font-bold">75%</text>
                  <text x="175" y="108" className="text-[10px] fill-neutral-500 font-sans font-bold">100%</text>
                </svg>

                {/* Big Center Metric tightly fitted right under the arc */}
                <div className="text-center -mt-6">
                  <div className="text-3xl font-extrabold text-neutral-900 tracking-tight font-sans">
                    100<span className="text-xl font-bold text-neutral-500">%</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-bold">
                    Statutory Chain of Custody Intact
                  </p>
                </div>
              </div>

              {/* Category Filter Buttons directly below without awkward dead gap */}
              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-[#ece8e1]">
                <button
                  onClick={() => setActiveEvidenceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeEvidenceFilter === 'all'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#f6f4f1] border border-[#e2ded6] text-neutral-700 hover:border-black'
                  }`}
                >
                  All Exhibits
                </button>

                <button
                  onClick={() => setActiveEvidenceFilter('forensic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeEvidenceFilter === 'forensic'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#f6f4f1] border border-[#e2ded6] text-neutral-700 hover:border-black'
                  }`}
                >
                  FSL Lab
                </button>

                <button
                  onClick={() => setActiveEvidenceFilter('certs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeEvidenceFilter === 'certs'
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-[#f6f4f1] border border-[#e2ded6] text-neutral-700 hover:border-black'
                  }`}
                >
                  Sec 63 Certs
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Right Column: Solid Cryptographic Core Card (lg:col-span-3) - NO AI SLOP */}
        <div className="lg:col-span-3">
          <div className="bg-[#0a0a0a] text-white rounded-2xl p-7 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[580px] border border-black">
            
            {/* Top Minimalist Geometric Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ea4242]" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                WORM ENCLAVE
              </span>
            </div>

            {/* Typography Header */}
            <div className="mt-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight font-sans">
                Zero Tamper
              </h2>
              <p className="text-xs text-neutral-400 font-medium mt-1 uppercase tracking-wider">
                Cryptographic Evidence Enclave
              </p>
            </div>

            {/* Crisp Solid Abstract Geometric Vector Art */}
            <div className="my-auto py-4 relative flex items-center justify-center">
              <svg
                className="w-full max-w-[220px] h-[240px] text-white overflow-visible"
                viewBox="0 0 240 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Orbit Rings with Subtle Slow Rotation */}
                <ellipse cx="120" cy="130" rx="100" ry="60" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" className="animate-orbital-spin" />
                <ellipse cx="120" cy="130" rx="90" ry="105" stroke="white" strokeWidth="1.5" transform="rotate(-30 120 130)" className="animate-orbital-spin-reverse" />
                <ellipse cx="120" cy="130" rx="90" ry="105" stroke="white" strokeWidth="1.5" transform="rotate(30 120 130)" />

                {/* Center Core */}
                <circle cx="120" cy="130" r="44" stroke="white" strokeWidth="2.5" />
                <circle cx="120" cy="130" r="30" stroke="#ea4242" strokeWidth="2" />
                <circle cx="120" cy="130" r="14" fill="white" />
                <circle cx="120" cy="130" r="6" fill="#ea4242" />

                {/* Cardinal Axes */}
                <line x1="120" y1="15" x2="120" y2="80" stroke="white" strokeWidth="1.5" />
                <line x1="120" y1="180" x2="120" y2="245" stroke="white" strokeWidth="1.5" />
                <line x1="15" y1="130" x2="70" y2="130" stroke="white" strokeWidth="1.5" />
                <line x1="170" y1="130" x2="225" y2="130" stroke="white" strokeWidth="1.5" />

                {/* Node Markers */}
                <circle cx="120" cy="15" r="4" fill="white" />
                <circle cx="120" cy="245" r="4" fill="white" />
                <circle cx="15" cy="130" r="4" fill="white" />
                <circle cx="225" cy="130" r="4" fill="white" />

                <circle cx="50" cy="65" r="3" fill="#ea4242" />
                <circle cx="190" cy="65" r="3" fill="#ea4242" />
                <circle cx="50" cy="195" r="3" fill="#ea4242" />
                <circle cx="190" cy="195" r="3" fill="#ea4242" />
              </svg>
            </div>

            {/* Institutional Security Specs List */}
            <div className="space-y-2 text-xs font-mono border-t border-neutral-800 pt-4">
              <div className="flex justify-between text-neutral-400">
                <span>Standard:</span>
                <span className="text-white font-bold">NIST FIPS 180-4</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Asymmetric PKI:</span>
                <span className="text-white font-bold">RSA-2048 / SHA-256</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Admissibility:</span>
                <span className="text-[#ea4242] font-bold">BSA 2023 §63</span>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-4">
              <button
                onClick={() => onNavigateTab('ledger')}
                className="w-full bg-white text-black hover:bg-neutral-200 font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer uppercase tracking-wider"
              >
                Audit Cryptographic Ledger
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
