import React, { useState } from 'react';
import {
  Download,
  Key,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Eye,
  Lock,
  ArrowRight,
  ExternalLink,
  Fingerprint,
  Terminal,
  Radio,
  FileText,
  BadgeAlert,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileSignature,
  Database,
  Search,
} from 'lucide-react';
import { Recipient, EncryptedPackage, DecryptionEvent, WatermarkPayload } from '../types';
import { DistributionService } from '../services/distributionService';
import {
  WorkstationSurface,
  OperationalButton,
  StatusBadge,
  CryptoDataBlock,
  TechnicalMetricTile,
} from './ui/WorkstationPrimitives';

interface RecipientPortalProps {
  recipients: Recipient[];
  activePackage: EncryptedPackage | null;
  onDecryptionSuccess: (result: {
    recipient: Recipient;
    watermarkedText: string;
    decryptionEvent: DecryptionEvent;
    watermarkPayload: WatermarkPayload;
    blockHeight: number;
  }) => void;
  onSimulateLeak: (leakedText: string, metadata: { title: string; recipientName: string }) => void;
  onNavigateToForensics: () => void;
  onNavigateToLedger: () => void;
}

export const RecipientPortal: React.FC<RecipientPortalProps> = ({
  recipients,
  activePackage,
  onDecryptionSuccess,
  onSimulateLeak,
  onNavigateToForensics,
  onNavigateToLedger,
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(recipients[0]?.id || '');
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [revealStego, setRevealStego] = useState<boolean>(false);
  const [showRawSignature, setShowRawSignature] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [decryptedResult, setDecryptedResult] = useState<{
    watermarkedText: string;
    decryptionEvent: DecryptionEvent;
    watermarkPayload: WatermarkPayload;
    blockHeight: number;
    blockHash: string;
    psnr: number;
    ssim: number;
  } | null>(null);

  const currentRecipient = recipients.find((r) => r.id === selectedRecipientId) || recipients[0];
  const hasEnvelope = activePackage?.envelopes.some((e) => e.recipientId === currentRecipient?.id);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleExecuteDecryption = async () => {
    if (!activePackage || !currentRecipient || !hasEnvelope) return;
    setIsDecrypting(true);
    setActiveStep(1); // Authorization Verification

    try {
      await new Promise((r) => setTimeout(r, 260));
      setActiveStep(2); // ML-KEM-768 Decapsulation
      await new Promise((r) => setTimeout(r, 300));
      setActiveStep(3); // Symmetric Decryption
      await new Promise((r) => setTimeout(r, 300));
      setActiveStep(4); // Dynamic Steganographic Watermark
      await new Promise((r) => setTimeout(r, 320));
      setActiveStep(5); // ML-DSA-65 Signing
      await new Promise((r) => setTimeout(r, 360));
      setActiveStep(6); // DLT Consensus Finality

      const result = await DistributionService.executeRecipientDecryption(activePackage, currentRecipient);

      setDecryptedResult({
        watermarkedText: result.watermarkedText,
        decryptionEvent: result.decryptionEvent,
        watermarkPayload: result.watermarkPayload,
        blockHeight: result.blockHeight,
        blockHash: result.blockHash,
        psnr: result.psnrEstimate,
        ssim: result.ssimEstimate,
      });

      onDecryptionSuccess({
        recipient: currentRecipient,
        watermarkedText: result.watermarkedText,
        decryptionEvent: result.decryptionEvent,
        watermarkPayload: result.watermarkPayload,
        blockHeight: result.blockHeight,
      });
    } catch (err) {
      console.error('Decryption execution error:', err);
    } finally {
      setIsDecrypting(false);
      setActiveStep(0);
    }
  };

  const handleTriggerLeak = () => {
    if (!decryptedResult || !activePackage) return;
    onSimulateLeak(decryptedResult.watermarkedText, {
      title: activePackage.documentTitle,
      recipientName: currentRecipient.name,
    });
    onNavigateToForensics();
  };

  const handleDownloadDecrypted = () => {
    if (!decryptedResult) return;
    const blob = new Blob([decryptedResult.watermarkedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRecipient.name.toLowerCase().replace(/\s+/g, '_')}_decrypted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pipelineStages = [
    { num: 1, label: '01 ACCESS GATE', sub: 'Envelope Match' },
    { num: 2, label: '02 ML-KEM-768', sub: 'Decapsulation' },
    { num: 3, label: '03 AES-256-GCM', sub: 'Plaintext Recovery' },
    { num: 4, label: '04 STEGO BIND', sub: 'Session Fingerprint' },
    { num: 5, label: '05 ML-DSA-65', sub: 'Hardware Signing' },
    { num: 6, label: '06 DLT ANCHOR', sub: 'Consensus Finality' },
  ];

  return (
    <div className="space-y-5">
      {/* ========================================================= */}
      {/* 1. COMPACT RECIPIENT OPERATIONS CONTEXT HEADER           */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#768390] uppercase font-bold">
              RECIPIENT OPERATIONS
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-[10px] font-mono text-[#7ee787] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7ee787]" />
              ENCLAVE ACTIVE
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#e6edf3] tracking-tight">
            Secure Decryption Workstation &amp; Provenance Binding Gate
          </h2>
        </div>

        {/* Compact Telemetry Readouts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#768390]">
          <span className="px-2 py-1 rounded bg-[#12141a] border border-white/[0.08]">
            KEM: <strong className="text-[#e6edf3]">ML-KEM-768</strong>
          </span>
          <span className="px-2 py-1 rounded bg-[#12141a] border border-white/[0.08]">
            DSA: <strong className="text-[#e6edf3]">ML-DSA-65</strong>
          </span>
          <span className="px-2 py-1 rounded bg-[#12141a] border border-white/[0.08]">
            LEDGER: <strong className="text-[#e6edf3]">AIR-GAPPED 3/3</strong>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. OPERATOR IDENTITY & CRYPTOGRAPHIC ACCESS GATE ROW      */}
      {/* Replaces isolated persona cards with an integrated rail    */}
      {/* ========================================================= */}
      <WorkstationSurface variant="primary" className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-[#adbac7]" />
            <span className="font-semibold text-[#e6edf3] uppercase tracking-wider">
              OPERATOR CREDENTIAL REGISTER
            </span>
            <span className="text-[#768390] text-[11px]">
              ({recipients.length} Hardware Keystores Registered)
            </span>
          </div>
          <span className="text-[10px] text-[#768390]">
            SELECT OPERATOR PROFILE TO ENGAGE CLIENT KEYSTORE
          </span>
        </div>

        {/* Horizontal Credential Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {recipients.map((recip) => {
            const isSelected = recip.id === selectedRecipientId;
            const inPackage = activePackage?.envelopes.some((e) => e.recipientId === recip.id);

            return (
              <div
                key={recip.id}
                onClick={() => {
                  setSelectedRecipientId(recip.id);
                  setDecryptedResult(null); // Reset when switching persona
                  setRevealStego(false);
                }}
                className={`p-3 rounded-md border cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'border-white/[0.28] bg-[#1a1d24] text-[#e6edf3] ring-1 ring-white/10'
                    : 'border-white/[0.06] bg-[#0d0e12] text-[#adbac7] hover:border-white/[0.14] hover:bg-[#12141a]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isSelected ? 'bg-white/[0.16] text-[#e6edf3]' : 'bg-white/[0.05] text-[#768390]'
                  }`}>
                    {recip.avatarInitials}
                  </span>

                  {inPackage ? (
                    <span className="text-[10px] text-[#7ee787] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> ENVELOPE CLEARED
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#57606a] flex items-center gap-1">
                      NO ENVELOPE
                    </span>
                  )}
                </div>

                <div className="font-semibold text-xs text-[#e6edf3] truncate">
                  {recip.name}
                </div>
                <div className="text-[10px] text-[#768390] truncate font-mono mt-0.5">
                  {recip.role} &bull; {recip.clearanceLevel}
                </div>
                <div className="text-[9px] text-[#57606a] font-mono truncate mt-1">
                  FP: {recip.keys.keyFingerprint.slice(0, 16)}...
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Operator & Access Evaluation Banner */}
        <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-[#768390]">ACTIVE CREDENTIAL:</span>
            <span className="text-[#e6edf3] font-bold">{currentRecipient.name} ({currentRecipient.id})</span>
            <span className="text-white/20 hidden sm:inline">&bull;</span>
            <span className="text-[#768390]">CLEARANCE:</span>
            <span className="text-[#adbac7] font-semibold">{currentRecipient.clearanceLevel}</span>
            <span className="text-white/20 hidden sm:inline">&bull;</span>
            <span className="text-[#768390]">ALGORITHM SUITE:</span>
            <span className="text-[#c5cbd3]">ML-KEM-768 / ML-DSA-65</span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[#768390]">ACCESS GATE:</span>
            {hasEnvelope ? (
              <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.12] text-[#7ee787] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                AUTHORIZED FOR DECRYPTION
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#2b1012] border border-[#da3633]/40 text-[#f85149] font-bold flex items-center gap-1.5">
                <BadgeAlert className="w-3 h-3" />
                ACCESS REJECTED (NO ENVELOPE)
              </span>
            )}
          </div>
        </div>
      </WorkstationSurface>

      {/* ========================================================= */}
      {/* 3. EXECUTION DISPATCH BAR & LIVE OPERATIONAL PIPELINE     */}
      {/* Replaces the old static cards with an actionable corridor */}
      {/* ========================================================= */}
      <WorkstationSurface variant="elevated" className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#768390] uppercase font-bold">INBOUND PACKAGE MANIFEST:</span>
              <span className="text-[#e6edf3] font-semibold">
                {activePackage ? activePackage.packageId : 'NO PACKAGE LOADED'}
              </span>
              {activePackage && (
                <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-[#c5cbd3] text-[10px]">
                  {activePackage.documentTitle}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#768390] font-mono leading-tight">
              Executing decapsulation will bind an invisible session watermark to your clearance profile and sign the
              immutable DLT provenance record.
            </p>
          </div>

          <div className="shrink-0">
            <OperationalButton
              variant={hasEnvelope ? 'operational' : 'secondary'}
              size="lg"
              onClick={handleExecuteDecryption}
              disabled={!activePackage || !hasEnvelope || isDecrypting}
              icon={<Cpu className="w-4 h-4 text-[#adbac7]" />}
            >
              {isDecrypting
                ? 'EXECUTING CRYPTOGRAPHIC PIPELINE...'
                : decryptedResult
                ? 'RE-EXECUTE DECRYPTION & BIND PROVENANCE'
                : 'DECRYPT & BIND PROVENANCE EVENT'}
            </OperationalButton>
          </div>
        </div>

        {/* Operational Transition Pipeline: Always Visible, Dynamic States */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono pt-1">
          {pipelineStages.map((st) => {
            const isExecuting = isDecrypting && activeStep === st.num;
            const isCompleted = (isDecrypting && activeStep > st.num) || (decryptedResult !== null && !isDecrypting);
            const isFailed = !hasEnvelope && st.num === 1;

            return (
              <div
                key={`pipeline-stage-${st.num}`}
                className={`p-2.5 rounded-md border transition-all ${
                  isExecuting
                    ? 'bg-[#1f242d] border-white/[0.30] shadow-sm'
                    : isCompleted
                    ? 'bg-[#12141a] border-white/[0.12] text-[#adbac7]'
                    : isFailed
                    ? 'bg-[#2b1012] border-[#da3633]/40 text-[#f85149]'
                    : 'bg-[#0d0e12]/60 border-white/[0.04] text-[#57606a]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className={isExecuting ? 'text-[#e6edf3] font-bold' : isCompleted ? 'text-[#7ee787]' : 'text-[#768390]'}>
                    {isCompleted ? '✓ CLEARED' : isExecuting ? 'PROCESSING' : isFailed ? 'BLOCKED' : 'PENDING'}
                  </span>
                  {isExecuting && <span className="w-1.5 h-1.5 rounded-full bg-[#7ee787] animate-pulse" />}
                </div>

                <div className="font-semibold text-[11px] text-[#e6edf3] truncate">
                  {st.label}
                </div>
                <div className="text-[10px] text-[#768390] truncate mt-0.5">
                  {st.sub}
                </div>
              </div>
            );
          })}
        </div>
      </WorkstationSurface>

      {/* ========================================================= */}
      {/* 4. PRE-DECRYPTION STATE vs POST-DECRYPTION WORKSPACE     */}
      {/* When decrypted: Document Viewport dominates, Provenance    */}
      {/* and Verification follow as formal evidence registers.     */}
      {/* ========================================================= */}
      {decryptedResult ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* SECURE DOCUMENT VIEWPORT (Dominant Anchor) */}
          <WorkstationSurface variant="primary" className="p-0 overflow-hidden border-white/[0.12]">
            {/* Document Header & Handling Rules */}
            <div className="p-4 bg-[#14161b] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-[#adbac7] shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#e6edf3] uppercase tracking-wide">
                      SECURE DOCUMENT VIEWPORT
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-[#2b1012] border border-[#da3633]/30 text-[#f85149] text-[10px] font-mono font-bold">
                      TOP SECRET // SCI
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-[#adbac7] text-[10px] font-mono">
                      INSTANCE ID: {decryptedResult.decryptionEvent.watermarkId.slice(0, 10)}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#768390] mt-0.5">
                    TITLE: {activePackage?.documentTitle} &bull; AUTHORIZED VIEWER: {currentRecipient.name}
                  </div>
                </div>
              </div>

              {/* Forensic Channel Inspection Trigger */}
              <div className="shrink-0 flex items-center gap-2">
                <OperationalButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setRevealStego(!revealStego)}
                  icon={<Eye className={`w-3.5 h-3.5 ${revealStego ? 'text-[#f0883e]' : 'text-[#adbac7]'}`} />}
                >
                  {revealStego ? 'CLOSE FORENSIC INSPECTION' : 'INSPECT FORENSIC CHANNEL'}
                </OperationalButton>
              </div>
            </div>

            {/* Forensic Stego Inspection Sub-Layer (Muted Ochre Channel) */}
            {revealStego && (
              <div className="p-3.5 bg-[#261c10] border-b border-[#f0883e]/30 text-xs font-mono text-[#f0883e] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-[#f0883e]" />
                    FORENSIC CHANNEL INSPECTION ACTIVE
                  </span>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-black/40 border border-[#f0883e]/30">
                    DIAGNOSTIC TELEMETRY ONLY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-black/30 border border-[#f0883e]/20">
                    <span className="text-[#f0883e]/70 block text-[10px]">SESSION UUID</span>
                    <span className="break-all font-semibold">{decryptedResult.watermarkPayload.sessionId}</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-[#f0883e]/20">
                    <span className="text-[#f0883e]/70 block text-[10px]">WATERMARK IDENTIFIER</span>
                    <span className="break-all font-semibold">{decryptedResult.watermarkPayload.watermarkId}</span>
                  </div>
                  <div className="p-2 rounded bg-black/30 border border-[#f0883e]/20">
                    <span className="text-[#f0883e]/70 block text-[10px]">RECIPIENT FINGERPRINT</span>
                    <span className="break-all font-semibold">{decryptedResult.watermarkPayload.recipientFingerprint}</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#f0883e]/80 leading-relaxed">
                  Notice: The document displayed below remains 100% human-readable and visually identical to other recipients.
                  The cryptographic payload is encoded steganographically into whitespace entropy, ready for forensic recovery.
                </p>
              </div>
            )}

            {/* Document Content Box */}
            <div className="p-5 font-mono text-xs text-[#c5cbd3] bg-[#0d0e12] leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text border-b border-white/[0.06]">
              {decryptedResult.watermarkedText}
            </div>

            {/* Document Action & Handoff Footer */}
            <div className="p-3 bg-[#12141a] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#768390] text-[11px]">
                <FileSignature className="w-3.5 h-3.5 text-[#7ee787]" />
                <span>
                  Plaintext decrypted via CEK &bull; Bound to {currentRecipient.name}&apos;s hardware keystore
                </span>
              </div>

              <div className="flex items-center gap-2">
                <OperationalButton
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadDecrypted}
                  icon={<Download className="w-3.5 h-3.5 text-[#adbac7]" />}
                >
                  Download Decrypted Copy (.txt)
                </OperationalButton>

                <OperationalButton
                  variant="danger"
                  size="sm"
                  onClick={handleTriggerLeak}
                  icon={<AlertTriangle className="w-3.5 h-3.5 text-[#f85149]" />}
                >
                  Simulate Leak of {currentRecipient.name}&apos;s Copy
                </OperationalButton>
              </div>
            </div>
          </WorkstationSurface>

          {/* FORMAL DECRYPTION PROVENANCE & FORENSIC EVIDENCE REGISTERS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Formal Provenance Record (col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              <WorkstationSurface variant="elevated" className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="font-semibold text-[#e6edf3] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7ee787]" />
                    Decryption Provenance Record
                  </span>
                  <span className="text-[10px] text-[#7ee787] font-bold">
                    RATIFIED BY CONSENSUS
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] flex justify-between items-center">
                    <span className="text-[#768390]">EVENT IDENTIFIER:</span>
                    <span className="text-[#e6edf3] font-bold">{decryptedResult.decryptionEvent.eventId}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] flex justify-between items-center">
                    <span className="text-[#768390]">RECIPIENT SIGNER:</span>
                    <span className="text-[#c5cbd3]">{currentRecipient.name} ({currentRecipient.id})</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] flex justify-between items-center">
                    <span className="text-[#768390]">WATERMARK COMMITMENT:</span>
                    <span className="text-[#c5cbd3] truncate max-w-[240px]">
                      {decryptedResult.decryptionEvent.watermarkCommitment}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] flex justify-between items-center">
                    <span className="text-[#768390]">DLT ANCHOR REFERENCE:</span>
                    <span className="text-[#7ee787] font-bold">
                      Block #{decryptedResult.blockHeight} &bull; {decryptedResult.blockHash.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                {/* NIST FIPS 204 Signature Disclosure */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#768390] uppercase">RECIPIENT ML-DSA-65 SIGNATURE:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(decryptedResult.decryptionEvent.recipientSignatureBase64, 'dsa-sig')}
                        className="text-[10px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'dsa-sig' ? <Check className="w-3 h-3 text-[#7ee787]" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'dsa-sig' ? 'Copied' : 'Copy Payload'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRawSignature(!showRawSignature)}
                        className="text-[10px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-0.5 cursor-pointer"
                      >
                        {showRawSignature ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {showRawSignature ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] text-[10px] text-[#c5cbd3] break-all leading-tight">
                    {showRawSignature
                      ? decryptedResult.decryptionEvent.recipientSignatureBase64
                      : `${decryptedResult.decryptionEvent.recipientSignatureBase64.slice(0, 72)}...`}
                  </div>
                </div>
              </WorkstationSurface>
            </div>

            {/* Right: Visual Invariance & DLT Finality Telemetry (col-span-5) */}
            <div className="lg:col-span-5 space-y-4">
              <WorkstationSurface variant="elevated" className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="font-semibold text-[#e6edf3] uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#adbac7]" />
                    Visual Invariance &amp; DLT Proof
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToLedger}
                    className="text-[10px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                  >
                    <span>DLT Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <TechnicalMetricTile
                    label="SSIM INDEX"
                    value={decryptedResult.ssim}
                    subtext="Mathematical Equivalence"
                    status="nominal"
                  />
                  <TechnicalMetricTile
                    label="STEGO PSNR"
                    value={`${decryptedResult.psnr} dB`}
                    subtext="Imperceptible Carrier"
                    status="nominal"
                  />
                  <TechnicalMetricTile
                    label="LEDGER BLOCK"
                    value={`#${decryptedResult.blockHeight}`}
                    subtext="Finality Anchored"
                    status="nominal"
                  />
                  <TechnicalMetricTile
                    label="QUORUM STATE"
                    value="3/3 VALID"
                    subtext="Air-Gap Consensus"
                    status="nominal"
                  />
                </div>

                <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] text-[11px] text-[#768390] leading-relaxed">
                  <strong className="text-[#adbac7]">Verification Guarantee:</strong> While this document appears
                  visually identical to human readers and OCR engines (SSIM: {decryptedResult.ssim}), its hidden
                  steganographic encoding guarantees 100% mathematical non-repudiation if leaked.
                </div>
              </WorkstationSurface>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 5. PRE-DECRYPTION WAITING STATE                           */
        /* Clean, purposeful workstation state awaiting operator trigger*/
        /* ========================================================= */
        <WorkstationSurface variant="recessed" className="p-8 text-center space-y-3 font-mono">
          <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#768390]">
            <Lock className="w-5 h-5 text-[#adbac7]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#e6edf3]">
              Workstation Awaiting Cryptographic Decryption Trigger
            </h3>
            <p className="text-xs text-[#768390] max-w-md mx-auto mt-1 leading-relaxed">
              Verify your operator credential clearance above. When authorized, click &apos;Decrypt &amp; Bind Provenance Event&apos;
              to decapsulate the Content Encryption Key via ML-KEM-768 and commit the signed event to the ledger.
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#adbac7] px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7ee787]" />
              Client Enclave Ready &bull; Zero Server Knowledge
            </span>
          </div>
        </WorkstationSurface>
      )}
    </div>
  );
};
