import React, { useState } from 'react';
import {
  Award,
  FileCheck,
  QrCode,
  Printer,
  Plus,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import type { Certificate, DocumentItem, Case } from '@/services/api';
import type { UserRole } from './Header';

interface BsaCertificateViewProps {
  certificates: Certificate[];
  documents: DocumentItem[];
  cases: Case[];
  activeRole: UserRole;
  preselectedDocId?: string | null;
  onGenerateCertificate: (payload: any) => Promise<void>;
}

export function BsaCertificateView({
  certificates,
  documents,
  cases,
  activeRole,
  preselectedDocId,
  onGenerateCertificate
}: BsaCertificateViewProps) {
  const [selectedCertId, setSelectedCertId] = useState<string>(certificates[0]?.cert_id || '');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // New certificate form state
  const [targetDocId, setTargetDocId] = useState(preselectedDocId || documents[0]?.doc_id || '');
  const [partAOfficer, setPartAOfficer] = useState(activeRole.name);
  const [partADesignation, setPartADesignation] = useState('Investigating Officer, Cyber Crime PS Central');
  const [partADeclaration, setPartADeclaration] = useState(
    'I certify that the computer device used for generating and recording this electronic evidence was in lawful custody and operating properly throughout the recording period.'
  );
  const [partBExpert, setPartBExpert] = useState('Dr. Ananya Sen');
  const [partBDesignation, setPartBDesignation] = useState('Senior Scientific Officer (Cyber Forensics), FSL Delhi');
  const [partBDeclaration, setPartBDeclaration] = useState(
    'I certify that the cryptographic hash algorithm SHA-256 was applied to the electronic record and matches the genuine bit-stream profile. No subsequent modification has occurred.'
  );

  const selectedCert = certificates.find(c => c.cert_id === selectedCertId) || certificates[0];
  const linkedDoc = documents.find(d => d.doc_id === selectedCert?.doc_id);
  const linkedCase = cases.find(c => c.case_id === selectedCert?.case_id);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDocId) return;

    await onGenerateCertificate({
      doc_id: targetDocId,
      part_a_officer: partAOfficer,
      part_a_designation: partADesignation,
      part_a_declaration: partADeclaration,
      part_b_expert: partBExpert,
      part_b_designation: partBDesignation,
      part_b_declaration: partBDeclaration
    });

    setIsGenerateOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-neutral-300" />
            Bharatiya Sakshya Adhiniyam (BSA) 2023 • Section 63 Schedule Certificates
          </h2>
          <p className="text-xs text-neutral-400 font-mono">
            Mandatory two-signature legal admissibility certificates with SHA-256 cryptographic fingerprints
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export Court Certificate
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue New Sec 63 Certificate
          </Button>
        </div>
      </div>

      {/* Main Grid: Certificate Selector + Printable Official Schedule Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Certificate List (4 cols) */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider px-1">
            Issued Court Certificates ({certificates.length})
          </div>

          <div className="space-y-2">
            {certificates.map((cert) => {
              const isSelected = cert.cert_id === selectedCert?.cert_id;
              const doc = documents.find(d => d.doc_id === cert.doc_id);
              return (
                <div
                  key={cert.cert_id}
                  onClick={() => setSelectedCertId(cert.cert_id)}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-white bg-neutral-900 shadow-md'
                      : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-neutral-200">{cert.cert_id}</span>
                    <Badge variant="solid" className="text-[9px] bg-neutral-200 text-black">
                      BSA SEC 63
                    </Badge>
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-300 line-clamp-1 mb-2">
                    {doc ? doc.title : cert.doc_id}
                  </h4>
                  <div className="text-[10px] font-mono text-neutral-400 space-y-1">
                    <div className="truncate">IO: {cert.part_a_officer}</div>
                    <div className="truncate">Expert: {cert.part_b_expert}</div>
                    <div className="text-neutral-500 pt-1 border-t border-neutral-900">
                      {formatDate(cert.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Authentic Official Schedule Certificate (8 cols) */}
        <div className="lg:col-span-8">
          {selectedCert ? (
            <Card className="bg-neutral-950 border-neutral-700 shadow-xl overflow-hidden print:border-black print:text-black">
              {/* Official Seal Header */}
              <div className="border-b-2 border-neutral-800 bg-neutral-900/40 p-6 text-center space-y-2">
                <div className="w-12 h-12 mx-auto border-2 border-neutral-600 rounded-full flex items-center justify-center bg-neutral-950">
                  <Scale className="w-6 h-6 text-neutral-200" />
                </div>
                <h3 className="font-serif text-base font-bold tracking-widest uppercase text-white">
                  GOVERNMENT OF INDIA • JUDICIAL & POLICE REPOSITORY
                </h3>
                <h4 className="text-xs font-bold tracking-wider uppercase font-mono text-neutral-300">
                  THE BHARATIYA SAKSHYA ADHINIYAM, 2023
                </h4>
                <div className="inline-block border border-neutral-700 bg-neutral-900 px-3 py-1 rounded-xs font-mono text-[11px] text-neutral-200 font-semibold uppercase">
                  SCHEDULE (See Section 63) — CERTIFICATE FOR ADMISSIBILITY OF ELECTRONIC RECORD
                </div>
              </div>

              <CardContent className="p-6 space-y-6 font-mono text-xs">
                {/* Reference Identifiers */}
                <div className="grid grid-cols-2 gap-4 p-3 border border-neutral-800 bg-neutral-900/30 rounded-xs text-[11px]">
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">Certificate Identifier:</span>
                    <span className="text-neutral-100 font-bold">{selectedCert.cert_id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">Date of Certification:</span>
                    <span className="text-neutral-100">{formatDate(selectedCert.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">Case Reference:</span>
                    <span className="text-neutral-100">{linkedCase?.case_number || selectedCert.case_id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px]">Exhibit Document:</span>
                    <span className="text-neutral-100">{linkedDoc?.title || selectedCert.doc_id}</span>
                  </div>
                </div>

                {/* SHA-256 Fingerprint Box (Mandatory by Statute) */}
                <div className="border border-neutral-700 bg-neutral-950 p-4 rounded-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-neutral-300 tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-white" />
                      Statutory Cryptographic Hash Value (SHA-256 Fingerprint)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedCert.hash_value)}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      {copiedHash ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-xs break-all font-mono text-[11px] text-white font-semibold">
                    {selectedCert.hash_value}
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>Algorithm: {selectedCert.algorithm}</span>
                    <span>Standard: NIST FIPS 180-4 Verified</span>
                  </div>
                </div>

                {/* PART A: Declaration by Person In-Charge of Device */}
                <div className="border border-neutral-800 p-4 rounded-xs bg-neutral-900/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-bold uppercase tracking-wider text-neutral-200 text-xs">
                      PART A: Declaration by Person In-Charge of Computer Resource
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      Sec 63(4)(c) Compliant
                    </Badge>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed italic">
                    "{selectedCert.part_a_declaration}"
                  </p>
                  <div className="pt-3 flex justify-between items-end border-t border-neutral-800 text-[11px]">
                    <div>
                      <span className="text-neutral-500 text-[10px] block">Signatory Name & Rank:</span>
                      <span className="text-white font-semibold">{selectedCert.part_a_officer}</span>
                      <span className="text-neutral-400 block text-[10px]">{selectedCert.part_a_designation}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block">Cryptographic Sign-off:</span>
                      <span className="text-neutral-300 font-mono text-[10px] flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        Signed: {formatDate(selectedCert.part_a_signed_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PART B: Declaration by Expert */}
                <div className="border border-neutral-800 p-4 rounded-xs bg-neutral-900/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-bold uppercase tracking-wider text-neutral-200 text-xs">
                      PART B: Declaration by Technical / Forensic Expert
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      Sec 63(4) Expert Sign-off
                    </Badge>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed italic">
                    "{selectedCert.part_b_declaration}"
                  </p>
                  <div className="pt-3 flex justify-between items-end border-t border-neutral-800 text-[11px]">
                    <div>
                      <span className="text-neutral-500 text-[10px] block">Technical Expert Name & Office:</span>
                      <span className="text-white font-semibold">{selectedCert.part_b_expert}</span>
                      <span className="text-neutral-400 block text-[10px]">{selectedCert.part_b_designation}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block">Expert Forensic Sign-off:</span>
                      <span className="text-neutral-300 font-mono text-[10px] flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        Signed: {formatDate(selectedCert.part_b_signed_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code & Admissibility Attestation Footer */}
                <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border border-neutral-700 bg-neutral-900 flex items-center justify-center rounded-xs">
                      <QrCode className="w-8 h-8 text-neutral-300" />
                    </div>
                    <div>
                      <span className="text-neutral-200 font-semibold block">Official Evidentiary QR Seal</span>
                      <span>Scan in Courtroom Verification Portal for instant hash confirmation</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-200 font-semibold block uppercase">Statutory Presumption</span>
                    <span>Admissible under Sec 61 & 63 of Bharatiya Sakshya Adhiniyam, 2023</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 text-center border border-neutral-800 text-neutral-500 font-mono text-xs">
              No Section 63 certificate selected. Select one from the left panel or issue a new one.
            </div>
          )}
        </div>
      </div>

      {/* Issue New Certificate Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-950 border border-neutral-700 w-full max-w-2xl rounded-sm shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-100 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Issue Statutory Section 63 Certificate (BSA 2023)
              </h3>
              <button
                onClick={() => setIsGenerateOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-neutral-400 block mb-1 uppercase text-[10px]">Select Target Exhibit / Document *</label>
                <select
                  value={targetDocId}
                  onChange={(e) => setTargetDocId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-2 rounded-xs focus:outline-none focus:border-neutral-600"
                >
                  {documents.map((d) => (
                    <option key={d.doc_id} value={d.doc_id}>
                      {d.title} ({d.doc_type}) — SHA256: {d.sha256_hash.slice(0, 10)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Part A Form */}
              <div className="border border-neutral-800 p-3 rounded-xs space-y-2 bg-neutral-900/40">
                <span className="text-neutral-200 font-bold block uppercase text-[10px]">Part A (Officer In-Charge)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-500 text-[10px] block">Officer Name *</label>
                    <Input
                      required
                      value={partAOfficer}
                      onChange={(e) => setPartAOfficer(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500 text-[10px] block">Designation / Station</label>
                    <Input
                      value={partADesignation}
                      onChange={(e) => setPartADesignation(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-500 text-[10px] block">Statutory Declaration</label>
                  <textarea
                    rows={2}
                    value={partADeclaration}
                    onChange={(e) => setPartADeclaration(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 rounded-xs text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Part B Form */}
              <div className="border border-neutral-800 p-3 rounded-xs space-y-2 bg-neutral-900/40">
                <span className="text-neutral-200 font-bold block uppercase text-[10px]">Part B (Technical / Forensic Expert)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-neutral-500 text-[10px] block">Expert Name *</label>
                    <Input
                      required
                      value={partBExpert}
                      onChange={(e) => setPartBExpert(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-neutral-500 text-[10px] block">Expert Designation / Lab</label>
                    <Input
                      value={partBDesignation}
                      onChange={(e) => setPartBDesignation(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-500 text-[10px] block">Expert Technical Declaration</label>
                  <textarea
                    rows={2}
                    value={partBDeclaration}
                    onChange={(e) => setPartBDeclaration(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 p-2 rounded-xs text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xs text-[10px] text-neutral-400">
                Submitting this will generate the statutory Schedule certificate, compute the dual digital signatures, and commit a <strong>SIGN</strong> block to the Merkle ledger.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsGenerateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                >
                  Sign & Issue Court Certificate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
