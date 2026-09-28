import React, { useState } from 'react';
import {
  FileText,
  Users,
  Lock,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Code2,
  FileCode,
  Copy,
  Check,
  Upload,
  Plus,
  X,
  FileUp,
  ShieldCheck,
  Download,
  Terminal,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ClassifiedDocument, Recipient, EncryptedPackage, UiMode } from '../types';
import { DistributionService } from '../services/distributionService';
import { GuidancePanel } from './ui/GuidancePanel';
import {
  WorkstationSurface,
  OperationalButton,
  StatusBadge,
  CryptoDataBlock,
  TechnicalMetricTile,
} from './ui/WorkstationPrimitives';

interface SenderStudioProps {
  documents: ClassifiedDocument[];
  recipients: Recipient[];
  onPackageCreated: (pkg: EncryptedPackage) => void;
  activePackage: EncryptedPackage | null;
  onNavigateToRecipient: () => void;
  onAddDocument?: (doc: ClassifiedDocument) => void;
  uiMode?: UiMode;
}

export const SenderStudio: React.FC<SenderStudioProps> = ({
  documents,
  recipients,
  onPackageCreated,
  activePackage,
  onNavigateToRecipient,
  onAddDocument,
  uiMode = 'workstation',
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(
    recipients.slice(0, 3).map((r) => r.id) // Default Alice, Bob, Charlie
  );
  const [isPackaging, setIsPackaging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);

  // Custom Document Upload / Add state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customClassification, setCustomClassification] = useState<
    'TOP SECRET // SCI' | 'SECRET' | 'CONFIDENTIAL'
  >('SECRET');
  const [customText, setCustomText] = useState('');
  const [customSummary, setCustomSummary] = useState('');

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    if (!customTitle) {
      setCustomTitle(nameWithoutExt);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCustomText(content);
        if (!customSummary) {
          const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 80);
          setCustomSummary(firstLine || `Imported from ${file.name}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCustomDoc = () => {
    if (!customTitle.trim() || !customText.trim()) return;

    const newDoc: ClassifiedDocument = {
      id: `DOC-CUSTOM-${Date.now().toString(36).toUpperCase()}`,
      title: customTitle.trim(),
      classification: customClassification,
      caveats: 'NOFORN // REL TO AUTHORIZED DEFENSE RECIPIENTS',
      originatingOffice: 'LOCAL TEST ENCLAVE / WORKSTATION',
      summary: customSummary.trim() || customTitle.trim(),
      rawText: customText.trim(),
      visualPages: [],
      createdAt: Date.now(),
    };

    if (onAddDocument) {
      onAddDocument(newDoc);
    }
    setSelectedDocId(newDoc.id);
    setShowAddModal(false);
    // Reset form
    setCustomTitle('');
    setCustomText('');
    setCustomSummary('');
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((rId: string) => rId !== id) : [...prev, id]
    );
  };

  const handleSelectAllRecipients = () => {
    if (selectedRecipientIds.length === recipients.length) {
      setSelectedRecipientIds([]);
    } else {
      setSelectedRecipientIds(recipients.map((r) => r.id));
    }
  };

  const handleCreatePackage = async () => {
    if (!currentDoc || selectedRecipientIds.length === 0) return;
    setIsPackaging(true);

    try {
      const targetRecipients = recipients.filter((r) => selectedRecipientIds.includes(r.id));
      const pkg = await DistributionService.createEncryptedPackage(currentDoc, targetRecipients);
      onPackageCreated(pkg);
    } catch (err) {
      console.error('Packaging failed:', err);
    } finally {
      setIsPackaging(false);
    }
  };

  const copyPackageJson = () => {
    if (!activePackage) return;
    navigator.clipboard.writeText(JSON.stringify(activePackage, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPackage = () => {
    if (!activePackage) return;
    const blob = new Blob([JSON.stringify(activePackage, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePackage.packageId}.sihpkg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Guided Mode Instruction Panel */}
      {uiMode === 'guided' && (
        <GuidancePanel
          stepNumber="1"
          title="Broadcast Encryption & Multi-Recipient Key Packaging"
          summary="In standard systems, sending to multiple recipients creates identical files that cannot be attributed if leaked. Here, the document is encrypted once with a fast 256-bit symmetric key (AES-256-GCM), and that key is wrapped independently for each selected recipient using quantum-safe ML-KEM-768."
          recommendedAction="Keep Dr. Alice Vance and Col. Bob Martinez selected, but leave Charlie Chen UNCHECKED. Then click 'GENERATE ENCRYPTED PACKAGE'."
          whatToObserve="Notice that a separate post-quantum key envelope is created for Alice and Bob, sealing them into one tamper-proof container."
          actionButtonLabel="Generate Encrypted Package"
          onActionClick={handleCreatePackage}
        />
      )}

      {/* 1. SENDER OPERATIONS CONTEXT HEADER */}
      <WorkstationSurface variant="primary" className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="neutral" icon={<Lock className="w-3 h-3 text-[#adbac7]" />}>
              SENDER CONSOLE
            </StatusBadge>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              AES-256-GCM
            </span>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              ML-KEM-768
            </span>
            <span className="text-[11px] font-mono text-[#7ee787] px-2 py-0.5 rounded bg-[#7ee787]/10 border border-[#7ee787]/20">
              AIR-GAPPED
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <OperationalButton
              variant="secondary"
              size="sm"
              onClick={() => setShowAddModal(true)}
              icon={<Upload className="w-3 h-3" />}
            >
              Ingest Document
            </OperationalButton>

            <OperationalButton
              variant="operational"
              size="sm"
              onClick={handleCreatePackage}
              disabled={isPackaging || selectedRecipientIds.length === 0}
              icon={<Lock className="w-3 h-3" />}
            >
              {isPackaging ? 'PACKAGING...' : 'GENERATE ENCRYPTED PACKAGE'}
            </OperationalButton>
          </div>
        </div>
      </WorkstationSurface>

      {/* 2. MAIN WORKSTATION WORKFLOW: DOCUMENT DOSSIER & RECIPIENT REGISTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Dossier & Recipient Authorization Register (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Controlled Document Dossier */}
          <WorkstationSurface variant="primary">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#adbac7]" />
                <span className="text-sm font-semibold text-[#e6edf3]">
                  1. Classified Document Dossier
                </span>
              </div>
              <span className="text-xs font-mono text-[#768390]">
                {documents.length} Dossiers Registered
              </span>
            </div>

            {/* Document Selection List */}
            <div className="space-y-2">
              {documents.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                const isTopSecret = doc.classification.includes('TOP SECRET');

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-md border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-white/[0.24] bg-[#181b22] text-[#e6edf3]'
                        : 'border-white/[0.06] bg-[#0d0e12]/60 hover:bg-[#12141a] text-[#adbac7]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-tight ${
                              isTopSecret
                                ? 'bg-[#2b1012] text-[#f85149] border border-[#da3633]/40'
                                : 'bg-[#261c10] text-[#f0883e] border border-[#f0883e]/30'
                            }`}
                          >
                            {doc.classification}
                          </span>
                          <span className="text-xs font-mono text-[#768390]">{doc.id}</span>
                          <h4 className="text-xs font-bold text-[#e6edf3] truncate">{doc.title}</h4>
                        </div>
                        <p className="text-xs text-[#768390] line-clamp-1">{doc.summary}</p>
                      </div>

                      <div className="shrink-0 flex items-center pt-0.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] border ${
                            isSelected
                              ? 'bg-[#e6edf3] border-[#e6edf3] text-[#0a0b0d] font-bold'
                              : 'border-white/[0.20] bg-transparent'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Document Metadata Dossier & Plaintext Inspection */}
            {currentDoc && (
              <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06]">
                    <span className="text-[10px] text-[#768390] block uppercase">Security Tier</span>
                    <span className="text-[#e6edf3] font-semibold">{currentDoc.classification}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06]">
                    <span className="text-[10px] text-[#768390] block uppercase">Originating Office</span>
                    <span className="text-[#c5cbd3] truncate block">{currentDoc.originatingOffice}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06]">
                    <span className="text-[10px] text-[#768390] block uppercase">Handling Caveats</span>
                    <span className="text-[#adbac7] text-[11px] truncate block">{currentDoc.caveats}</span>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] font-mono text-xs text-[#768390]">
                  <div className="text-[10px] uppercase text-[#adbac7] mb-1 font-semibold flex items-center justify-between pb-1 border-b border-white/[0.04]">
                    <span>PLAINTEXT PAYLOAD DOSSIER &bull; RAW CONTENT PREVIEW</span>
                    <span>{currentDoc.rawText.length} BYTES</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-[#c5cbd3] max-h-28 overflow-y-auto pr-1">
                    {currentDoc.rawText.slice(0, 360)}...
                  </pre>
                </div>
              </div>
            )}
          </WorkstationSurface>

          {/* Section B: Recipient Authorization Register */}
          <WorkstationSurface variant="primary">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#adbac7]" />
                <span className="text-sm font-semibold text-[#e6edf3]">
                  2. Recipient Authorization Register
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllRecipients}
                  className="text-xs font-mono text-[#adbac7] hover:text-[#e6edf3] underline cursor-pointer"
                >
                  {selectedRecipientIds.length === recipients.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-xs font-mono text-[#e6edf3] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                  {selectedRecipientIds.length} of {recipients.length} Authorized
                </span>
              </div>
            </div>

            <p className="text-xs text-[#768390] mb-3 leading-relaxed">
              Select verified defense personnel. Each selected recipient receives a cryptographically isolated
              ML-KEM-768 key encapsulation envelope enabling single-party decapsulation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipients.map((recip) => {
                const isChecked = selectedRecipientIds.includes(recip.id);
                return (
                  <div
                    key={recip.id}
                    onClick={() => toggleRecipient(recip.id)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors flex items-start gap-3 select-none ${
                      isChecked
                        ? 'border-white/[0.24] bg-[#181b22] text-[#e6edf3]'
                        : 'border-white/[0.06] bg-[#0d0e12]/60 text-[#adbac7] hover:bg-[#12141a]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs shrink-0 font-mono ${
                        isChecked
                          ? 'bg-[#e6edf3] text-[#0a0b0d]'
                          : 'bg-white/[0.08] text-[#768390]'
                      }`}
                    >
                      {recip.avatarInitials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-semibold text-[#e6edf3] truncate">{recip.name}</h5>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-white/[0.20] bg-transparent text-[#e6edf3] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-[#768390] truncate">{recip.role}</p>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[#768390]">
                        <span className="text-[#adbac7]">KEM-768</span>
                        <span>&bull;</span>
                        <span className="truncate">FP: {recip.keys.keyFingerprint.slice(0, 10)}...</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Packaging Trigger Action Bar */}
            <div className="mt-5 pt-3 border-t border-white/[0.06]">
              <OperationalButton
                variant="operational"
                size="lg"
                onClick={handleCreatePackage}
                disabled={isPackaging || selectedRecipientIds.length === 0}
                className="w-full"
                icon={<Lock className="w-4 h-4" />}
              >
                {isPackaging
                  ? 'COMPUTING NIST FIPS 203 ENCAPSULATIONS...'
                  : `GENERATE ENCRYPTED PACKAGE (${selectedRecipientIds.length} RECIPIENTS)`}
              </OperationalButton>
            </div>
          </WorkstationSurface>
        </div>

        {/* Right Column: Cryptographic Container Inspector & Technical Payload (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Metric Telemetry Overview */}
          <div className="grid grid-cols-2 gap-3">
            <TechnicalMetricTile
              label="Selected Document"
              value={currentDoc ? currentDoc.id.replace('DOC-', '') : 'NONE'}
              subtext={currentDoc ? currentDoc.classification : 'No doc'}
              status="nominal"
            />
            <TechnicalMetricTile
              label="Authorized Clearances"
              value={`${selectedRecipientIds.length} Recipient${selectedRecipientIds.length === 1 ? '' : 's'}`}
              subtext="Isolated ML-KEM Envelopes"
              status="nominal"
            />
          </div>

          {/* Cryptographic Package Inspector Panel */}
          <WorkstationSurface variant="elevated" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#adbac7]" />
                <span className="text-xs font-mono font-bold text-[#e6edf3] uppercase tracking-wider">
                  Cryptographic Container Inspector
                </span>
              </div>
              {activePackage && (
                <button
                  type="button"
                  onClick={copyPackageJson}
                  className="flex items-center gap-1 text-[11px] font-mono text-[#adbac7] hover:text-[#e6edf3] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#7ee787]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            {activePackage ? (
              <div className="space-y-4">
                {/* Structural Package Metadata */}
                <div className="space-y-2">
                  <CryptoDataBlock
                    label="Distribution Package Identifier"
                    value={activePackage.packageId}
                    badge="SIHPKG"
                  />
                  <CryptoDataBlock
                    label="Source Document SHA-256 Digest"
                    value={activePackage.originalDocumentHashSha256}
                    badge="HASH"
                  />
                </div>

                {/* Recipient Key Envelopes Register */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#768390] uppercase">
                    <span className="font-semibold tracking-wider">
                      Recipient Key Envelopes ({activePackage.envelopes.length})
                    </span>
                    <span>ML-KEM-768</span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {activePackage.envelopes.map((env, idx) => (
                      <div
                        key={env.recipientId}
                        className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[#e6edf3]">
                          <span className="font-semibold text-xs">
                            #{idx + 1} {env.recipientName}
                          </span>
                          <span className="text-[10px] text-[#adbac7] px-1.5 py-0.2 rounded bg-white/[0.05] border border-white/[0.08]">
                            {env.kemAlgorithm}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#768390] truncate">
                          Wrapped CEK: {env.wrappedCekBase64.slice(0, 28)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Symmetric Ciphertext Envelope Readouts */}
                <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] text-xs font-mono text-[#768390] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span>Symmetric Cipher:</span>
                    <span className="text-[#e6edf3] font-semibold">AES-256-GCM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GCM IV:</span>
                    <span className="text-[#c5cbd3]">{activePackage.ivHex}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GCM Auth Tag:</span>
                    <span className="text-[#c5cbd3]">{activePackage.tagHex}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ciphertext Payload:</span>
                    <span className="text-[#7ee787] font-semibold">
                      {Math.round(activePackage.ciphertextBase64.length * 0.75)} bytes
                    </span>
                  </div>
                </div>

                {/* Technical Payload Toggle (Secondary Progressive Disclosure) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRawPayload(!showRawPayload)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded bg-[#0d0e12] border border-white/[0.06] text-xs font-mono text-[#adbac7] hover:text-[#e6edf3] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      {showRawPayload ? 'Hide Raw Technical Representation' : 'Inspect Raw Container Serialization'}
                    </span>
                    {showRawPayload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showRawPayload && (
                    <div className="mt-2 p-3 rounded bg-[#0a0b0d] border border-white/[0.08] font-mono text-[10px] text-[#768390] max-h-40 overflow-y-auto leading-relaxed">
                      <pre className="whitespace-pre-wrap break-all text-[#c5cbd3]">
                        {JSON.stringify(activePackage, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Operational Export & Workflow Transfer Handoff */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <OperationalButton
                    variant="secondary"
                    size="md"
                    onClick={downloadPackage}
                    className="w-full"
                    icon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export Container File (.sihpkg)
                  </OperationalButton>

                  <OperationalButton
                    variant="operational"
                    size="md"
                    onClick={onNavigateToRecipient}
                    className="w-full"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Handoff to Recipient Decryption Portal
                  </OperationalButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-[#768390] border border-dashed border-white/[0.08] rounded-md">
                <Code2 className="w-8 h-8 mb-2 text-[#adbac7] opacity-40" />
                <p className="text-xs font-mono font-semibold text-[#e6edf3]">Awaiting Package Assembly</p>
                <p className="text-[11px] font-mono text-[#768390] mt-1 max-w-xs leading-relaxed">
                  Select a classified document and at least one authorized recipient, then execute the broadcast packaging
                  operation to generate the NIST PQC distribution container.
                </p>
              </div>
            )}
          </WorkstationSurface>
        </div>
      </div>

      {/* 3. CONTROLLED DOCUMENT INGESTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <WorkstationSurface variant="elevated" className="w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-[#adbac7]" />
                <h3 className="text-sm font-bold text-[#e6edf3] font-mono uppercase tracking-wide">
                  Ingest Classified Document Payload
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded hover:bg-white/[0.05] text-[#768390] hover:text-[#e6edf3] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ingestion Surface */}
            <div className="p-4 rounded-md border border-dashed border-white/[0.12] bg-[#0d0e12] text-center hover:bg-[#12141a] transition-colors">
              <input
                type="file"
                id="doc-file-input"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="doc-file-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className="w-6 h-6 text-[#adbac7]" />
                <span className="text-xs font-semibold text-[#e6edf3]">
                  Select Local File (.txt or .md)
                </span>
                <span className="text-[11px] font-mono text-[#768390]">
                  Plaintext or Markdown specifications supported for post-quantum packaging
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#adbac7] mb-1">
                  Document Title <span className="text-[#f85149]">*</span>
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Project Nebula Security Assessment"
                  className="w-full px-3 py-2 rounded-md bg-[#0d0e12] border border-white/[0.08] text-[#e6edf3] text-xs font-mono focus:border-white/[0.24] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#adbac7] mb-1">
                  Security Classification
                </label>
                <select
                  value={customClassification}
                  onChange={(e) => setCustomClassification(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md bg-[#0d0e12] border border-white/[0.08] text-[#e6edf3] text-xs font-mono focus:border-white/[0.24] outline-none"
                >
                  <option value="SECRET">SECRET</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="TOP SECRET // SCI">TOP SECRET // SCI</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#adbac7] mb-1">
                Executive Summary
              </label>
              <input
                type="text"
                value={customSummary}
                onChange={(e) => setCustomSummary(e.target.value)}
                placeholder="Short summary of the defense artifact payload"
                className="w-full px-3 py-2 rounded-md bg-[#0d0e12] border border-white/[0.08] text-[#e6edf3] text-xs font-mono focus:border-white/[0.24] outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono text-[#adbac7]">
                  Plaintext Body <span className="text-[#f85149]">*</span>
                </label>
                <span className="text-[11px] font-mono text-[#768390]">
                  {customText.length} characters ({customText.split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={6}
                placeholder="Type or paste classified document content..."
                className="w-full p-3 rounded-md bg-[#0d0e12] border border-white/[0.08] text-[#e6edf3] text-xs font-mono focus:border-white/[0.24] outline-none leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <OperationalButton
                variant="secondary"
                size="md"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </OperationalButton>

              <OperationalButton
                variant="operational"
                size="md"
                onClick={handleSaveCustomDoc}
                disabled={!customTitle.trim() || !customText.trim()}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Register Ingested Dossier
              </OperationalButton>
            </div>
          </WorkstationSurface>
        </div>
      )}
    </div>
  );
};
