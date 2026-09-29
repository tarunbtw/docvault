import React, { useState } from 'react';
import {
  FolderLock,
  Plus,
  Search,
  FileText,
  ChevronRight,
  Shield,
  ShieldCheck,
  Clock,
  User,
  Hash,
  Scale,
  ArrowUpRight,
  Layers,
  FileCheck2,
  Calendar,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { Case, DocumentItem } from '@/services/api';
import type { UserRole } from './Header';

interface CasesViewProps {
  cases: Case[];
  activeRole: UserRole;
  onSelectDocument: (doc: DocumentItem) => void;
  onCreateCase: (newCase: Partial<Case>) => Promise<void>;
}

export function CasesView({
  cases,
  activeRole,
  onSelectDocument,
  onCreateCase
}: CasesViewProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.case_id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCaseNumber, setNewCaseNumber] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCrimeHead, setNewCrimeHead] = useState('');
  const [newStation, setNewStation] = useState(activeRole.station);
  const [newSections, setNewSections] = useState('Sec 318(4) BNS, Sec 66C IT Act');

  const filteredCases = cases.filter(c =>
    c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.crime_head.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sections_of_law.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCase = cases.find(c => c.case_id === selectedCaseId) || cases[0];
  const totalExhibits = cases.reduce((acc, c) => acc + (c.documents_count || c.documents?.length || 0), 0);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseNumber || !newTitle) return;

    await onCreateCase({
      case_number: newCaseNumber,
      title: newTitle,
      crime_head: newCrimeHead || 'General Investigation',
      station: newStation,
      jurisdiction: newStation,
      sections_of_law: newSections,
      investigating_officer: activeRole.name,
      io_badge: activeRole.badge
    });

    setIsCreateOpen(false);
    setNewCaseNumber('');
    setNewTitle('');
  };

  return (
    <div className="space-y-8 pb-16 font-sans animate-view-fade">
      
      {/* Designer Hero Card with Abstract Geometric Vector Graphic */}
      <div className="relative bg-white border border-[#e2ded6] rounded-2xl p-7 shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Subtle Abstract Wave Motif (Corner Art) */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-20">
          <svg width="340" height="200" viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0C80 40 180 20 240 80C300 140 320 200 340 200" stroke="#ea4242" strokeWidth="2" />
            <path d="M40 0C110 50 200 30 260 90C310 140 330 200 340 170" stroke="black" strokeWidth="1.5" />
            <circle cx="280" cy="90" r="40" stroke="#ea4242" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="280" cy="90" r="20" stroke="black" strokeWidth="1.2" />
          </svg>
        </div>

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs shadow-xs">
              <FolderLock className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white bg-[#ea4242] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Investigation Registry
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
            Investigation Dockets & Case Files
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Statutory case dossiers cataloging FIRs, panchnamas, forensic reports, and charge sheets under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              {cases.length} Total Dockets
            </span>
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              {totalExhibits} Attached Exhibits
            </span>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> 100% Chain-Intact
            </span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FIR / Section / IO..."
              className="pl-10 h-11 bg-[#f6f4f1] border-[#e2ded6] rounded-xl text-xs font-medium focus:bg-white"
            />
          </div>

          <Button
            variant="default"
            size="default"
            onClick={() => setIsCreateOpen(true)}
            className="h-11 px-5 shadow-xs gap-2 font-bold text-xs bg-black hover:bg-neutral-800 text-white rounded-xl shrink-0"
          >
            <Plus className="w-4 h-4 text-[#ea4242]" />
            New Docket
          </Button>
        </div>
      </div>

      {/* Main Grid: Cases List (Left) + Selected Case Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Case List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
            <span>Dockets ({filteredCases.length})</span>
            <span className="text-[11px] text-neutral-400 font-mono">Select to open</span>
          </div>

          <div className="space-y-3">
            {filteredCases.map((c) => {
              const isSelected = c.case_id === selectedCase?.case_id;
              return (
                <div
                  key={c.case_id}
                  onClick={() => setSelectedCaseId(c.case_id)}
                  className={`p-6 rounded-[28px] border cursor-pointer transition-all duration-300 relative group ${
                    isSelected
                      ? 'border-2 border-black bg-white shadow-lg ring-4 ring-black/5 -translate-y-0.5'
                      : 'border-[#e8e5df] bg-white hover:border-black/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span className="font-mono text-xs font-extrabold text-neutral-900 bg-[#f6f4f1] px-3.5 py-1 rounded-full border border-[#e8e5df]">
                      {c.case_number}
                    </span>
                    <Badge variant={c.status === 'CHARGE_SHEETED' ? 'solid' : 'default'} className="text-xs">
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 line-clamp-1 mb-2.5 group-hover:text-[#ea4242] transition-colors">
                    {c.title}
                  </h3>

                  <div className="space-y-2 text-xs text-neutral-600">
                    <div className="flex items-center gap-2 truncate">
                      <Scale className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="truncate text-neutral-600 font-medium">{c.sections_of_law}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 pt-2.5 border-t border-[#f1eee8]">
                      <span>IO: <strong className="text-neutral-700">{c.investigating_officer}</strong></span>
                      <span className="font-bold text-neutral-900 font-mono">
                        {c.documents_count || c.documents?.length || 0} Exhibits
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Case Dossier (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <Card className="bg-white border-[#e8e5df] rounded-[32px] shadow-sm overflow-hidden">
              <CardHeader className="border-b border-[#f1eee8] p-8 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-sm font-mono font-extrabold text-neutral-900 bg-[#f6f4f1] px-4 py-1 rounded-full border border-[#e8e5df]">
                        {selectedCase.case_number}
                      </span>
                      <Badge variant="outline" className="text-xs font-bold">
                        {selectedCase.crime_head}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl text-neutral-900 font-extrabold tracking-tight">
                      {selectedCase.title}
                    </CardTitle>
                  </div>
                  <Badge variant={selectedCase.status === 'CHARGE_SHEETED' ? 'solid' : 'default'} className="self-start sm:self-auto text-xs px-3.5 py-1">
                    {selectedCase.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-8 p-8 pt-6">
                {/* Meta details table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-5 bg-[#f6f4f1]/70 border border-[#e8e5df] rounded-[24px]">
                  <div>
                    <span className="text-neutral-400 text-[11px] block uppercase font-bold">Jurisdiction & PS</span>
                    <span className="text-neutral-900 font-semibold text-sm mt-0.5 block">{selectedCase.station}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px] block uppercase font-bold">Investigating Officer</span>
                    <span className="text-neutral-900 font-semibold text-sm mt-0.5 block">{selectedCase.investigating_officer} ({selectedCase.io_badge})</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px] block uppercase font-bold">Statutory Sections</span>
                    <span className="text-neutral-900 font-semibold text-sm mt-0.5 block">{selectedCase.sections_of_law}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px] block uppercase font-bold">Incident / Filing Date</span>
                    <span className="text-neutral-900 font-mono text-sm mt-0.5 block">{formatDate(selectedCase.incident_date)}</span>
                  </div>
                </div>

                {/* Evidence Exhibits & Legal Documents List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm uppercase tracking-wider font-extrabold text-neutral-900 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#ea4242]" />
                      Evidentiary Exhibits & Files ({selectedCase.documents?.length || 0})
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">
                      Click to inspect bit-stream
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedCase.documents && selectedCase.documents.length > 0 ? (
                      selectedCase.documents.map((doc) => (
                        <div
                          key={doc.doc_id}
                          onClick={() => onSelectDocument(doc)}
                          className="flex items-center justify-between p-4 border border-[#e8e5df] bg-white hover:border-black/30 hover:bg-[#f6f4f1]/50 rounded-[24px] cursor-pointer transition-all group shadow-2xs hover:shadow-xs"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-black text-white flex items-center justify-center rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-sm font-bold text-neutral-900 group-hover:text-[#ea4242] transition-colors">
                                  {doc.title}
                                </span>
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                  {doc.doc_type}
                                </Badge>
                              </div>
                              <div className="text-xs font-mono text-neutral-500 flex flex-wrap items-center gap-2.5 mt-1">
                                <span className="text-[#ea4242] font-semibold">SHA-256: {doc.sha256_hash.slice(0, 8)}...</span>
                                <span>•</span>
                                <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                                <span>•</span>
                                <span>By: {doc.created_by}</span>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-black transition-transform group-hover:translate-x-1" />
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center border border-dashed border-[#e8e5df] rounded-[28px] text-sm text-neutral-400 bg-[#f6f4f1]/30">
                        No electronic exhibits uploaded for this case docket yet.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-16 text-center border border-[#e8e5df] bg-white rounded-[32px] text-neutral-400 text-sm">
              Select a case docket from the left panel to inspect the evidentiary record.
            </div>
          )}
        </div>
      </div>

      {/* New Case Registration Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#e8e5df] w-full max-w-xl rounded-[32px] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#f1eee8] pb-4">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2.5">
                <FolderLock className="w-5 h-5 text-[#ea4242]" />
                Register New Electronic Case Docket
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-700 block mb-1 text-xs font-bold">FIR Number / Docket ID *</label>
                <Input
                  required
                  placeholder="e.g. FIR No. 289/2024"
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                  className="rounded-2xl h-11 text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 text-xs font-bold">Case Caption / Title *</label>
                <Input
                  required
                  placeholder="e.g. State vs. Suspect Name & Ors"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-2xl h-11 text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 text-xs font-bold">Crime Classification Head</label>
                <Input
                  placeholder="e.g. Cyber Financial Crime / Armed Robbery"
                  value={newCrimeHead}
                  onChange={(e) => setNewCrimeHead(e.target.value)}
                  className="rounded-2xl h-11 text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 text-xs font-bold">Statutory Acts & Sections</label>
                <Input
                  placeholder="e.g. Sec 318(4) BNS 2023, Sec 66C IT Act"
                  value={newSections}
                  onChange={(e) => setNewSections(e.target.value)}
                  className="rounded-2xl h-11 text-xs"
                />
              </div>

              <div>
                <label className="text-neutral-700 block mb-1 text-xs font-bold">Police Station / Jurisdiction</label>
                <Input
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                  className="rounded-2xl h-11 text-xs"
                />
              </div>

              <div className="p-4 bg-[#f6f4f1] border border-[#e8e5df] rounded-2xl text-xs text-neutral-600 leading-relaxed">
                Registering this docket commits an <strong>INGEST</strong> block into the Merkle chain of custody ledger with officer credential <strong>{activeRole.badge}</strong>.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#ece8e1]">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border-[#e2ded6]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="default"
                  className="rounded-xl bg-black text-white hover:bg-neutral-800 font-bold"
                >
                  Create Docket & Commit to Ledger
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
