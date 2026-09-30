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
  ExternalLink,
  FileText,
  Search,
  HardDrive,
  Hash,
  Shield,
  Clock,
  User,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  const [searchTerm, setSearchTerm] = useState('');
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

  const selectedCert = certificates.find((c) => c.cert_id === selectedCertId) || certificates[0];
  const linkedDoc = documents.find((d) => d.doc_id === selectedCert?.doc_id);
  const linkedCase = cases.find((c) => c.case_id === selectedCert?.case_id);

  const filteredCertificates = certificates.filter((cert) => {
    const doc = documents.find((d) => d.doc_id === cert.doc_id);
    const text = `${cert.cert_id} ${cert.part_a_officer} ${cert.part_b_expert} ${doc?.title || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

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
    <div className="space-y-7 pb-16 font-sans animate-view-fade">
      
      {/* Institutional Hero Banner with Solid Styling */}
      <div className="bg-white border border-[#e2ded6] rounded-2xl p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4 text-[#ea4242]" />
            </div>
            <span className="text-[11px] font-bold text-white bg-[#ea4242] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Statutory Evidence Certificate
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
            Bharatiya Sakshya Adhiniyam, 2023 — Section 63 Certificates
          </h1>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Statutory two-signature admissibility certificates embedding SHA-256 cryptographic fingerprints, co-signed by Officer In-Charge and Forensic Technical Expert pursuant to the Schedule to Section 63, BSA 2023.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              {certificates.length} Issued Certificates
            </span>
            <span className="text-xs font-bold bg-[#f6f4f1] text-neutral-900 px-3 py-1 rounded-xl border border-[#e2ded6]">
              RSA-2048 PKI Attestation
            </span>
            <span className="text-xs font-bold font-mono bg-black text-white px-3 py-1 rounded-xl border border-black flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ea4242]" /> COURT ADMISSIBLE
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="default"
            onClick={handlePrint}
            className="h-11 px-4 gap-2 font-bold text-xs rounded-xl border-[#e2ded6] bg-white hover:bg-[#ece8e1] text-neutral-800"
          >
            <Printer className="w-4 h-4" />
            Print / Export Official Schedule
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={() => setIsGenerateOpen(true)}
            className="h-11 px-5 shadow-xs gap-2 font-bold text-xs bg-black hover:bg-neutral-800 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 text-[#ea4242]" />
            Issue New Certificate
          </Button>
        </div>
      </div>

      {/* Main Grid: Fully Utilizes Screen Width with Zero Dead Space */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* Left Column: Certificate Selector & Statutory Attestation Matrix (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-5 no-print">
          
          {/* Certificate Selection Card */}
          <div className="bg-white border border-[#e2ded6] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Issued Certificates ({certificates.length})
              </span>
              <span className="text-[11px] font-mono text-neutral-500">Select to View</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search certificate or officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f6f4f1] border border-[#e2ded6] pl-9 pr-3.5 py-2 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black"
              />
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {filteredCertificates.map((cert) => {
                const isSelected = cert.cert_id === selectedCert?.cert_id;
                const doc = documents.find((d) => d.doc_id === cert.doc_id);
                return (
                  <div
                    key={cert.cert_id}
                    onClick={() => setSelectedCertId(cert.cert_id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-black bg-[#f6f4f1] shadow-xs'
                        : 'border-[#ece8e1] bg-white hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-neutral-900 font-mono text-[11px] bg-white px-2.5 py-0.5 rounded-md border border-[#e2ded6]">
                        {cert.cert_id}
                      </span>
                      <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded-md">
                        BSA SEC 63
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 mb-1">
                      {doc ? doc.title : cert.doc_id}
                    </h4>

                    <div className="text-[11px] text-neutral-600 space-y-0.5">
                      <div className="truncate">IO: <strong className="text-neutral-800">{cert.part_a_officer}</strong></div>
                      <div className="truncate">Expert: <strong className="text-neutral-800">{cert.part_b_expert}</strong></div>
                      <div className="text-neutral-400 pt-1.5 border-t border-[#ece8e1] font-mono text-[10px]">
                        {formatDate(cert.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statutory Attestation Matrix - Fills the Vertical Space Productively */}
          <div className="bg-white border border-[#e2ded6] rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-2">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#ea4242]" />
                BSA 2023 Statutory Admissibility Rules
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-700">
              <div className="p-3 rounded-xl bg-[#f6f4f1] border border-[#e2ded6]">
                <p className="font-bold text-neutral-900 text-xs">Section 63(2) Condition A:</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Device produced the electronic record during period over which it was regularly used.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f4f1] border border-[#e2ded6]">
                <p className="font-bold text-neutral-900 text-xs">Section 63(2) Condition B:</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Information was regularly fed into computer in ordinary course of stated activities.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f6f4f1] border border-[#e2ded6]">
                <p className="font-bold text-neutral-900 text-xs">Section 63(4) Mandatory Co-Signature:</p>
                <p className="text-[11px] text-neutral-600 mt-0.5">
                  Dual signature requirement: Officer in charge of computer + Forensic technical examiner.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: High-Fidelity Official Schedule Certificate (lg:col-span-8) */}
        <div className="lg:col-span-8">
          {selectedCert ? (
            <Card className="bg-white border border-[#e2ded6] rounded-2xl shadow-xs overflow-hidden print:border-black print:text-black">
              
              {/* Official Seal Header */}
              <div className="border-b border-[#ece8e1] bg-[#f6f4f1] p-7 text-center space-y-2">
                <div className="w-14 h-14 mx-auto border-2 border-black rounded-xl flex items-center justify-center bg-white shadow-2xs">
                  <Scale className="w-7 h-7 text-black" />
                </div>
                <h3 className="font-serif text-base font-extrabold tracking-widest uppercase text-neutral-900">
                  GOVERNMENT OF INDIA • JUDICIAL & EVIDENCE VAULT
                </h3>
                <h4 className="text-xs font-bold tracking-wider uppercase text-neutral-700 font-sans">
                  THE BHARATIYA SAKSHYA ADHINIYAM, 2023
                </h4>
                <div className="inline-block border border-[#e2ded6] bg-white px-3.5 py-1 rounded-lg font-mono text-xs text-neutral-900 font-bold uppercase shadow-2xs">
                  SCHEDULE (See Section 63) — CERTIFICATE FOR ADMISSIBILITY OF ELECTRONIC RECORD
                </div>
              </div>

              <CardContent className="p-7 space-y-6 text-xs">
                
                {/* Reference Identifiers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border border-[#e2ded6] bg-[#f6f4f1] rounded-xl text-xs">
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px] font-bold">Certificate ID:</span>
                    <span className="text-neutral-900 font-bold font-mono text-xs mt-0.5 block">{selectedCert.cert_id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px] font-bold">Certification Date:</span>
                    <span className="text-neutral-900 font-mono text-xs mt-0.5 block">{formatDate(selectedCert.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px] font-bold">Case Reference:</span>
                    <span className="text-neutral-900 font-bold text-xs mt-0.5 block">{linkedCase?.case_number || selectedCert.case_id}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block text-[10px] font-bold">Exhibit Title:</span>
                    <span className="text-neutral-900 font-bold text-xs mt-0.5 block truncate">{linkedDoc?.title || selectedCert.doc_id}</span>
                  </div>
                </div>

                {/* SHA-256 Fingerprint Box (Mandatory by Statute) */}
                <div className="border border-[#e2ded6] bg-white p-5 rounded-xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#ea4242]" />
                      Statutory Cryptographic Hash Value (SHA-256 Fingerprint)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedCert.hash_value)}
                      className="text-neutral-700 hover:text-black flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                      {copiedHash ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                  <div className="bg-[#f6f4f1] border border-[#e2ded6] p-3.5 rounded-lg break-all font-mono text-xs text-neutral-900 font-bold">
                    {selectedCert.hash_value}
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
                    <span>Algorithm: {selectedCert.algorithm}</span>
                    <span>Standard: NIST FIPS 180-4 Verified</span>
                  </div>
                </div>

                {/* PART A: Declaration by Person In-Charge of Device */}
                <div className="border border-[#e2ded6] p-5 rounded-xl bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#ece8e1] pb-2">
                    <span className="font-bold text-neutral-900 text-xs">
                      PART A: Declaration by Person In-Charge of Computer Resource
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold rounded-md">
                      Sec 63(4)(c) Compliant
                    </Badge>
                  </div>
                  <p className="text-neutral-800 text-xs leading-relaxed italic bg-[#f6f4f1] p-3 rounded-lg border border-[#e2ded6]">
                    "{selectedCert.part_a_declaration}"
                  </p>
                  <div className="pt-2 flex justify-between items-end text-xs">
                    <div>
                      <span className="text-neutral-500 text-[10px] block font-bold uppercase">Signatory Officer:</span>
                      <span className="text-neutral-900 font-bold text-xs block">{selectedCert.part_a_officer}</span>
                      <span className="text-neutral-600 block text-[11px] mt-0.5">{selectedCert.part_a_designation}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block font-bold uppercase">Cryptographic Sign-off:</span>
                      <span className="text-neutral-800 font-mono text-[11px] flex items-center gap-1.5 justify-end mt-0.5 font-bold">
                        <Check className="w-4 h-4 text-black" />
                        Signed: {formatDate(selectedCert.part_a_signed_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PART B: Declaration by Expert */}
                <div className="border border-[#e2ded6] p-5 rounded-xl bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#ece8e1] pb-2">
                    <span className="font-bold text-neutral-900 text-xs">
                      PART B: Declaration by Technical / Forensic Expert
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold rounded-md">
                      Sec 63(4) Expert Sign-off
                    </Badge>
                  </div>
                  <p className="text-neutral-800 text-xs leading-relaxed italic bg-[#f6f4f1] p-3 rounded-lg border border-[#e2ded6]">
                    "{selectedCert.part_b_declaration}"
                  </p>
                  <div className="pt-2 flex justify-between items-end text-xs">
                    <div>
                      <span className="text-neutral-500 text-[10px] block font-bold uppercase">Forensic Technical Expert:</span>
                      <span className="text-neutral-900 font-bold text-xs block">{selectedCert.part_b_expert}</span>
                      <span className="text-neutral-600 block text-[11px] mt-0.5">{selectedCert.part_b_designation}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 text-[10px] block font-bold uppercase">Expert Forensic Sign-off:</span>
                      <span className="text-neutral-800 font-mono text-[11px] flex items-center gap-1.5 justify-end mt-0.5 font-bold">
                        <Check className="w-4 h-4 text-black" />
                        Signed: {formatDate(selectedCert.part_b_signed_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code & Admissibility Attestation Footer */}
                <div className="flex items-center justify-between border-t border-[#ece8e1] pt-4 text-xs text-neutral-600">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border border-[#e2ded6] bg-[#f6f4f1] flex items-center justify-center rounded-xl shadow-2xs">
                      <QrCode className="w-8 h-8 text-neutral-900" />
                    </div>
                    <div>
                      <span className="text-neutral-900 font-bold block text-xs">Official Evidentiary QR Seal</span>
                      <span className="text-[11px] text-neutral-500">Scan in Courtroom Portal for instant hash confirmation</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-900 font-bold block text-xs uppercase">Statutory Presumption</span>
                    <span className="text-[11px] text-neutral-500">Admissible under Sec 61 & 63 of Bharatiya Sakshya Adhiniyam, 2023</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          ) : (
            <div className="p-16 text-center border border-[#e2ded6] bg-white rounded-2xl text-neutral-400 text-sm">
              No Section 63 certificate selected. Select one from the left panel or issue a new one.
            </div>
          )}
        </div>

      </div>

      {/* Issue New Certificate Modal - Solid, No Translucent Neon */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2ded6] w-full max-w-2xl rounded-2xl shadow-2xl p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-[#ea4242]" />
                Issue Statutory Section 63 Certificate (BSA 2023)
              </h3>
              <button
                onClick={() => setIsGenerateOpen(false)}
                className="text-neutral-500 hover:text-black w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#ece8e1] cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-900 block mb-1 text-xs font-bold">Select Target Exhibit / Document *</label>
                <select
                  value={targetDocId}
                  onChange={(e) => setTargetDocId(e.target.value)}
                  className="w-full bg-[#f6f4f1] border border-[#e2ded6] text-neutral-900 p-2.5 rounded-xl focus:outline-none focus:border-black text-xs font-medium"
                >
                  {documents.map((d) => (
                    <option key={d.doc_id} value={d.doc_id}>
                      {d.title} ({d.doc_type}) — SHA256: {d.sha256_hash.slice(0, 12)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Part A Form */}
              <div className="border border-[#e2ded6] p-4 rounded-xl space-y-3 bg-[#f6f4f1]">
                <span className="text-neutral-900 font-bold block text-xs uppercase tracking-wider">Part A (Officer In-Charge)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-600 text-xs block font-bold">Officer Name *</label>
                    <Input
                      required
                      value={partAOfficer}
                      onChange={(e) => setPartAOfficer(e.target.value)}
                      className="rounded-xl h-10 text-xs bg-white border-[#e2ded6]"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-600 text-xs block font-bold">Designation / Station</label>
                    <Input
                      value={partADesignation}
                      onChange={(e) => setPartADesignation(e.target.value)}
                      className="rounded-xl h-10 text-xs bg-white border-[#e2ded6]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-600 text-xs block font-bold">Statutory Declaration</label>
                  <textarea
                    rows={2}
                    value={partADeclaration}
                    onChange={(e) => setPartADeclaration(e.target.value)}
                    className="w-full bg-white border border-[#e2ded6] text-neutral-900 p-2.5 rounded-xl text-xs focus:outline-none focus:border-black font-sans resize-none"
                  />
                </div>
              </div>

              {/* Part B Form */}
              <div className="border border-[#e2ded6] p-4 rounded-xl space-y-3 bg-[#f6f4f1]">
                <span className="text-neutral-900 font-bold block text-xs uppercase tracking-wider">Part B (Technical / Forensic Expert)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-600 text-xs block font-bold">Expert Name *</label>
                    <Input
                      required
                      value={partBExpert}
                      onChange={(e) => setPartBExpert(e.target.value)}
                      className="rounded-xl h-10 text-xs bg-white border-[#e2ded6]"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-600 text-xs block font-bold">Expert Designation / Lab</label>
                    <Input
                      value={partBDesignation}
                      onChange={(e) => setPartBDesignation(e.target.value)}
                      className="rounded-xl h-10 text-xs bg-white border-[#e2ded6]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-neutral-600 text-xs block font-bold">Expert Technical Declaration</label>
                  <textarea
                    rows={2}
                    value={partBDeclaration}
                    onChange={(e) => setPartBDeclaration(e.target.value)}
                    className="w-full bg-white border border-[#e2ded6] text-neutral-900 p-2.5 rounded-xl text-xs focus:outline-none focus:border-black font-sans resize-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#ece8e1] border border-[#e2ded6] rounded-xl text-xs text-neutral-700 leading-relaxed">
                Submitting this generates the statutory Schedule certificate, computes the digital signatures, and commits a <strong>SIGN</strong> block to the Merkle ledger.
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#ece8e1]">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => setIsGenerateOpen(false)}
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
