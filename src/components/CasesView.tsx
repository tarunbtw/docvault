import React, { useState } from 'react';
import {
  FolderLock,
  Plus,
  Search,
  FileText,
  ChevronRight,
  Shield,
  Clock,
  User,
  Hash,
  Scale
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
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-neutral-300" />
            Investigation Dockets & Electronic Case Files
          </h2>
          <p className="text-xs text-neutral-400 font-mono">
            Digital custody and judicial records managed under Bharatiya Sakshya Adhiniyam, 2023
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FIR / Section / Title..."
              className="pl-8"
            />
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Case Docket
          </Button>
        </div>
      </div>

      {/* Main Grid: Cases List (Left) + Selected Case Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Case List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider px-1">
            Registered Dockets ({filteredCases.length})
          </div>

          <div className="space-y-2">
            {filteredCases.map((c) => {
              const isSelected = c.case_id === selectedCase?.case_id;
              return (
                <div
                  key={c.case_id}
                  onClick={() => setSelectedCaseId(c.case_id)}
                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-white bg-neutral-900/90 shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-neutral-200">
                      {c.case_number}
                    </span>
                    <Badge variant={c.status === 'CHARGE_SHEETED' ? 'solid' : 'outline'}>
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h3 className="text-xs font-semibold text-neutral-100 line-clamp-1 mb-2">
                    {c.title}
                  </h3>

                  <div className="space-y-1 text-[11px] font-mono text-neutral-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <Scale className="w-3 h-3 text-neutral-500 shrink-0" />
                      <span className="truncate">{c.sections_of_law}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-900">
                      <span>IO: {c.investigating_officer}</span>
                      <span>{formatDate(c.incident_date).slice(0, 11)}</span>
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
            <Card className="bg-neutral-950 border-neutral-800">
              <CardHeader className="bg-neutral-900/50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {selectedCase.case_number}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {selectedCase.crime_head}
                      </Badge>
                    </div>
                    <CardTitle className="mt-1 text-sm text-neutral-100">
                      {selectedCase.title}
                    </CardTitle>
                  </div>
                  <Badge variant={selectedCase.status === 'CHARGE_SHEETED' ? 'solid' : 'outline'}>
                    {selectedCase.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-5">
                {/* Meta details table */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono p-3 bg-neutral-900/30 border border-neutral-800 rounded-xs">
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Jurisdiction & PS</span>
                    <span className="text-neutral-200">{selectedCase.station}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Investigating Officer</span>
                    <span className="text-neutral-200">{selectedCase.investigating_officer} ({selectedCase.io_badge})</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Statutory Sections</span>
                    <span className="text-neutral-200">{selectedCase.sections_of_law}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block uppercase">Incident / GD Date</span>
                    <span className="text-neutral-200">{formatDate(selectedCase.incident_date)}</span>
                  </div>
                </div>

                {/* Evidence Exhibits & Legal Documents List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-300">
                      Dossier Documents & Exhibits ({selectedCase.documents?.length || 0})
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Click to inspect bit-stream & watermark
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedCase.documents && selectedCase.documents.length > 0 ? (
                      selectedCase.documents.map((doc) => (
                        <div
                          key={doc.doc_id}
                          onClick={() => onSelectDocument(doc)}
                          className="flex items-center justify-between p-3 border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-600 rounded-sm cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 border border-neutral-800 bg-neutral-950 flex items-center justify-center rounded-xs group-hover:border-neutral-600">
                              <FileText className="w-4 h-4 text-neutral-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                                  {doc.title}
                                </span>
                                <Badge variant="secondary" className="text-[9px]">
                                  {doc.doc_type}
                                </Badge>
                              </div>
                              <div className="text-[10px] font-mono text-neutral-500 flex items-center gap-3 mt-0.5">
                                <span>SHA-256: {doc.sha256_hash.slice(0, 10)}...</span>
                                <span>•</span>
                                <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                                <span>•</span>
                                <span>By: {doc.created_by}</span>
                              </div>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center border border-dashed border-neutral-800 rounded-sm text-xs font-mono text-neutral-500">
                        No electronic exhibits uploaded for this case docket yet.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center border border-neutral-800 text-neutral-500 font-mono text-xs">
              Select a case docket from the left panel to inspect the evidentiary record.
            </div>
          )}
        </div>
      </div>

      {/* New Case Registration Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-700 w-full max-w-lg rounded-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                <FolderLock className="w-4 h-4" />
                Register New Electronic Case Docket
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">FIR Number / Docket ID *</label>
                <Input
                  required
                  placeholder="e.g. FIR No. 289/2024"
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Case Caption / Title *</label>
                <Input
                  required
                  placeholder="e.g. State vs. Suspect Name & Ors"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Crime Classification Head</label>
                <Input
                  placeholder="e.g. Cyber Financial Crime / Armed Robbery"
                  value={newCrimeHead}
                  onChange={(e) => setNewCrimeHead(e.target.value)}
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Statutory Acts & Sections</label>
                <Input
                  placeholder="e.g. Sec 318(4) BNS 2023, Sec 66C IT Act"
                  value={newSections}
                  onChange={(e) => setNewSections(e.target.value)}
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Police Station / Jurisdiction</label>
                <Input
                  value={newStation}
                  onChange={(e) => setNewStation(e.target.value)}
                />
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xs text-[10px] text-neutral-400">
                Registering this docket will commit an <strong>INGEST</strong> block to the cryptographic chain of custody ledger with officer credential <strong>{activeRole.badge}</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
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
