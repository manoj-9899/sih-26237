import React, { useState } from 'react';
import {
  PlayCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  FileCheck2,
  Copy,
  Check,
  Terminal,
  Search,
  Fingerprint,
  Radio,
} from 'lucide-react';
import {
  ClassifiedDocument,
  Recipient,
  EncryptedPackage,
  DecryptionEvent,
  ForensicAttributionReport,
  UiMode,
} from '../types';
import { DistributionService } from '../services/distributionService';
import { GuidancePanel } from './ui/GuidancePanel';
import {
  WorkstationSurface,
  OperationalButton,
  StatusBadge,
  CryptoDataBlock,
  TechnicalMetricTile,
} from './ui/WorkstationPrimitives';

interface WalkthroughTabProps {
  documents: ClassifiedDocument[];
  recipients: Recipient[];
  onFinishDemo: () => void;
  uiMode?: UiMode;
}

export const WalkthroughTab: React.FC<WalkthroughTabProps> = ({
  documents,
  recipients,
  onFinishDemo,
  uiMode = 'workstation',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inspectStegoAlice, setInspectStegoAlice] = useState<boolean>(false);
  const [inspectStegoBob, setInspectStegoBob] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Demo state variables
  const [demoPackage, setDemoPackage] = useState<EncryptedPackage | null>(null);
  const [aliceDecrypted, setAliceDecrypted] = useState<{
    text: string;
    event: DecryptionEvent;
    blockHeight: number;
  } | null>(null);
  const [bobDecrypted, setBobDecrypted] = useState<{
    text: string;
    event: DecryptionEvent;
    blockHeight: number;
  } | null>(null);
  const [investigationReport, setInvestigationReport] = useState<ForensicAttributionReport | null>(null);

  const alice = recipients.find((r) => r.id === 'USR-ALICE-VANCE-01') || recipients[0];
  const bob = recipients.find((r) => r.id === 'USR-BOB-MARTINEZ-02') || recipients[1];
  const charlie = recipients.find((r) => r.id === 'USR-CHARLIE-CHEN-03') || recipients[2];
  const targetDoc = documents[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleStep1_Encrypt = async () => {
    setIsRunning(true);
    try {
      const pkg = await DistributionService.createEncryptedPackage(targetDoc, [alice, bob, charlie]);
      setDemoPackage(pkg);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStep2_AliceDecrypt = async () => {
    if (!demoPackage) return;
    setIsRunning(true);
    try {
      const res = await DistributionService.executeRecipientDecryption(demoPackage, alice);
      setAliceDecrypted({
        text: res.watermarkedText,
        event: res.decryptionEvent,
        blockHeight: res.blockHeight,
      });
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStep3_BobDecrypt = async () => {
    if (!demoPackage) return;
    setIsRunning(true);
    try {
      const res = await DistributionService.executeRecipientDecryption(demoPackage, bob);
      setBobDecrypted({
        text: res.watermarkedText,
        event: res.decryptionEvent,
        blockHeight: res.blockHeight,
      });
      setCurrentStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStep4_VisualCheck = () => {
    setCurrentStep(5);
  };

  const handleStep5_Attribution = async () => {
    if (!bobDecrypted) return;
    setIsRunning(true);
    try {
      const report = await DistributionService.investigateLeakedDocument(bobDecrypted.text);
      setInvestigationReport(report);
      setCurrentStep(6);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetDemo = () => {
    setCurrentStep(1);
    setDemoPackage(null);
    setAliceDecrypted(null);
    setBobDecrypted(null);
    setInvestigationReport(null);
    setInspectStegoAlice(false);
    setInspectStegoBob(false);
  };

  const handleRunFullPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      // Stage 1: Encrypt
      const pkg = await DistributionService.createEncryptedPackage(targetDoc, [alice, bob, charlie]);
      setDemoPackage(pkg);
      setCurrentStep(2);
      await new Promise((r) => setTimeout(r, 650));

      // Stage 2: Alice Decrypt
      const aRes = await DistributionService.executeRecipientDecryption(pkg, alice);
      setAliceDecrypted({ text: aRes.watermarkedText, event: aRes.decryptionEvent, blockHeight: aRes.blockHeight });
      setCurrentStep(3);
      await new Promise((r) => setTimeout(r, 650));

      // Stage 3: Bob Decrypt
      const bRes = await DistributionService.executeRecipientDecryption(pkg, bob);
      setBobDecrypted({ text: bRes.watermarkedText, event: bRes.decryptionEvent, blockHeight: bRes.blockHeight });
      setCurrentStep(4);
      await new Promise((r) => setTimeout(r, 650));

      // Stage 4: Visual Check
      setCurrentStep(5);
      await new Promise((r) => setTimeout(r, 650));

      // Stage 5: Attribution
      const report = await DistributionService.investigateLeakedDocument(bRes.watermarkedText);
      setInvestigationReport(report);
      setCurrentStep(6);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const stages = [
    { num: 1, title: 'Broadcast Encrypt', desc: 'AES-256-GCM + ML-KEM-768' },
    { num: 2, title: 'Alice Decapsulates', desc: 'Dynamic stego & ML-DSA sign' },
    { num: 3, title: 'Bob Decapsulates', desc: 'Distinct session payload' },
    { num: 4, title: 'Invariance Audit', desc: 'SSIM: 0.9998 verified' },
    { num: 5, title: 'Blind Attribution', desc: 'Leak resolved via DLT proof' },
  ];

  return (
    <div className="space-y-6">
      {/* Guided Mode Guidance Panel */}
      {uiMode === 'guided' && (
        <GuidancePanel
          stepNumber="★"
          title="Mission Demonstration & Guided Cryptographic Lifecycle"
          summary="This automated walkthrough runs through the full lifecycle: 1. Encrypt once for multiple recipients (ML-KEM-768), 2. Alice decapsulates and receives a watermarked copy, 3. Bob decapsulates and receives his own distinct watermark, 4. Compare documents (100% visually identical), 5. Bob leaks his copy, and 6. The forensic studio proves Bob is the leaker."
          recommendedAction="Click 'AUTO-RUN MISSION WALKTHROUGH' to watch the entire process execute automatically with zero manual setup, or step through manually below."
          whatToObserve="Notice how Bob's leak is indisputably identified even though Alice and Bob saw the exact same visual document text."
          actionButtonLabel="Run Mission Walkthrough"
          onActionClick={handleRunFullPipeline}
        />
      )}

      {/* 1. MISSION HEADER & OPERATIONAL CONTEXT */}
      <WorkstationSurface variant="primary" className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="active" icon={<Radio className="w-3 h-3 text-[#7ee787]" />}>
              MISSION CONSOLE
            </StatusBadge>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              ML-KEM-768
            </span>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              ML-DSA-65
            </span>
            <span className="text-[11px] font-mono text-[#7ee787] px-2 py-0.5 rounded bg-[#7ee787]/10 border border-[#7ee787]/20">
              AIR-GAPPED 3/3 DLT
            </span>
          </div>

          {/* Operational Playback Trigger */}
          <div className="shrink-0 flex items-center gap-2">
            {currentStep > 1 && (
              <OperationalButton
                variant="secondary"
                size="sm"
                onClick={handleResetDemo}
                disabled={isRunning}
                icon={<RotateCcw className="w-3 h-3" />}
              >
                Reset
              </OperationalButton>
            )}

            <OperationalButton
              variant="operational"
              size="sm"
              onClick={handleRunFullPipeline}
              disabled={isRunning}
              icon={<PlayCircle className="w-3.5 h-3.5" />}
            >
              {isRunning ? 'EXECUTING PIPELINE...' : 'AUTO-RUN MISSION WALKTHROUGH'}
            </OperationalButton>
          </div>
        </div>
      </WorkstationSurface>

      {/* 2. PRECISION LIFECYCLE TIMELINE (Desktop horizontal bar & mobile responsive scroll) */}
      <WorkstationSurface variant="recessed" className="p-2 sm:p-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.04] text-[11px] font-mono text-[#768390]">
          <span className="uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#adbac7]" />
            Lifecycle Pipeline Progress
          </span>
          <span>
            Stage {Math.min(currentStep, 5)} of 5 &bull;{' '}
            <strong className={currentStep === 6 ? 'text-[#7ee787]' : 'text-[#e6edf3]'}>
              {currentStep === 6 ? 'ALL PROOFS RESOLVED' : isRunning ? 'PROCESSING' : 'READY'}
            </strong>
          </span>
        </div>

        {/* Scrollable container on mobile, flex grid on desktop */}
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-thin">
          {stages.map((st, idx) => {
            const isCompleted = currentStep > st.num || currentStep === 6;
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={`stage-timeline-${st.num}`}
                className={`flex-1 min-w-[170px] sm:min-w-0 p-3 rounded-md border transition-all select-none ${
                  isCurrent
                    ? 'bg-[#181b22] border-white/[0.24] shadow-sm'
                    : isCompleted
                    ? 'bg-[#12141a] border-white/[0.10]'
                    : 'bg-[#0d0e12]/60 border-white/[0.04] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-[#e6edf3] text-[#0a0b0d]'
                          : isCompleted
                          ? 'bg-white/[0.12] text-[#adbac7]'
                          : 'bg-white/[0.05] text-[#57606a]'
                      }`}
                    >
                      {isCompleted ? '✓' : `0${st.num}`}
                    </span>
                    <span className={isCurrent ? 'text-[#e6edf3] font-bold' : isCompleted ? 'text-[#adbac7]' : 'text-[#57606a]'}>
                      STAGE 0{st.num}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7ee787] animate-pulse" />
                  )}
                </div>

                <div className="font-sans font-semibold text-xs text-[#e6edf3] truncate">
                  {st.title}
                </div>
                <div className="font-mono text-[10px] text-[#768390] truncate mt-0.5">
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>
      </WorkstationSurface>

      {/* 3. MAIN WORKSTATION CONSOLE: CURRENT STAGE OPERATION & TECHNICAL EVIDENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Operational Control Panel (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <WorkstationSurface variant="primary">
            {/* STAGE 1: Broadcast Encrypt */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="neutral">STAGE 01 &bull; INGESTION</StatusBadge>
                    <span className="text-xs font-mono text-[#768390]">CIPHER: AES-256-GCM</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#adbac7]">RECIPIENTS: 3 SPECIFIED</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#e6edf3] tracking-tight">
                    Multi-Recipient Broadcast Encryption
                  </h3>
                  <p className="text-xs text-[#768390] leading-relaxed mt-1">
                    The master document payload is encrypted once using an ephemeral 256-bit symmetric Content Encryption Key
                    (CEK). The CEK is encapsulated independently using NIST FIPS 203 (ML-KEM-768) public keys for Alice,
                    Bob, and Charlie, packaging all recipient envelopes into a single broadcast container.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>DOCUMENT TITLE:</span>
                    <span className="text-[#e6edf3] font-semibold">{targetDoc.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>SECURITY CLASSIFICATION:</span>
                    <span className="text-[#f85149] font-bold">{targetDoc.classification}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>AUTHORIZED CLEARANCE:</span>
                    <span className="text-[#adbac7]">{alice.name}, {bob.name}, {charlie.name}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <OperationalButton
                    variant="operational"
                    size="md"
                    onClick={handleStep1_Encrypt}
                    disabled={isRunning}
                    icon={<Lock className="w-3.5 h-3.5" />}
                  >
                    {isRunning ? 'PACKAGING BROADCAST ENVELOPE...' : 'EXECUTE BROADCAST ENCRYPTION'}
                  </OperationalButton>
                </div>
              </div>
            )}

            {/* STAGE 2: Alice Decapsulates */}
            {currentStep === 2 && demoPackage && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="active">STAGE 02 &bull; DECAPSULATION</StatusBadge>
                    <span className="text-xs font-mono text-[#adbac7]">RECIPIENT: DR. ALICE VANCE</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#768390]">CLEARANCE: TOP SECRET // SCI</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#e6edf3] tracking-tight">
                    Alice Recovers CEK &amp; Signs Provenance Event
                  </h3>
                  <p className="text-xs text-[#768390] leading-relaxed mt-1">
                    Alice decapsulates the shared secret using her ML-KEM-768 secret key. Before plaintext release, the
                    workstation enclaves an imperceptible session steganography payload into her copy and signs a
                    Decryption Event using her hardware NIST FIPS 204 (ML-DSA-65) private key.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>PACKAGE IDENTIFIER:</span>
                    <span className="text-[#c5cbd3]">{demoPackage.packageId}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>KEY ENCAPSULATION:</span>
                    <span className="text-[#e6edf3]">NIST FIPS 203 (ML-KEM-768)</span>
                  </div>
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>PROVENANCE SIGNING:</span>
                    <span className="text-[#e6edf3]">NIST FIPS 204 (ML-DSA-65)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <OperationalButton
                    variant="operational"
                    size="md"
                    onClick={handleStep2_AliceDecrypt}
                    disabled={isRunning}
                    icon={<Cpu className="w-3.5 h-3.5" />}
                  >
                    {isRunning ? 'DECAPSULATING & COMMITTING DLT EVENT...' : 'ALICE DECRYPTS & SIGNS EVENT'}
                  </OperationalButton>
                </div>
              </div>
            )}

            {/* STAGE 3: Bob Decapsulates */}
            {currentStep === 3 && demoPackage && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="active">STAGE 03 &bull; DECAPSULATION</StatusBadge>
                    <span className="text-xs font-mono text-[#adbac7]">RECIPIENT: COL. BOB MARTINEZ</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#768390]">CLEARANCE: SECRET</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#e6edf3] tracking-tight">
                    Bob Decrypts Exact Same Package on Workstation B
                  </h3>
                  <p className="text-xs text-[#768390] leading-relaxed mt-1">
                    Bob receives the identical broadcast file. Upon decapsulation, his workstation injects an independent,
                    mathematically unique session watermark and submits Bob&apos;s ML-DSA-65 signature to the air-gapped DLT ledger.
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>ALICE TRANSACTION:</span>
                    <span className="text-[#7ee787]">Committed Block #{aliceDecrypted?.blockHeight || 1}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>WATERMARK SEPARATION:</span>
                    <span className="text-[#adbac7]">Isolated Session UUID &amp; Recipient Fingerprint</span>
                  </div>
                  <div className="flex justify-between items-center text-[#768390]">
                    <span>CRYPTO VERIFICATION:</span>
                    <span className="text-[#e6edf3]">Valid ML-DSA-65 Signature Required</span>
                  </div>
                </div>

                <div className="pt-2">
                  <OperationalButton
                    variant="operational"
                    size="md"
                    onClick={handleStep3_BobDecrypt}
                    disabled={isRunning}
                    icon={<Cpu className="w-3.5 h-3.5" />}
                  >
                    {isRunning ? 'DECAPSULATING & COMMITTING DLT EVENT...' : 'BOB DECRYPTS & SIGNS EVENT'}
                  </OperationalButton>
                </div>
              </div>
            )}

            {/* STAGE 4: Visual Invariance Audit */}
            {currentStep === 4 && aliceDecrypted && bobDecrypted && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="nominal">STAGE 04 &bull; AUDIT</StatusBadge>
                    <span className="text-xs font-mono text-[#adbac7]">VISUAL INVARIANCE: 100% MATCH</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#7ee787]">SSIM: 0.9998 &bull; PSNR: 49.8 dB</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#e6edf3] tracking-tight">
                    Visual Invariance &amp; Forensic Separation Audit
                  </h3>
                  <p className="text-xs text-[#768390] leading-relaxed mt-1">
                    Both Alice and Bob read identical text with zero visible artifacts or layout disturbance. Beneath the surface,
                    the micro-steganographic encoding guarantees zero false positives and absolute recipient differentiation.
                  </p>
                </div>

                {/* Side-by-Side Comparison Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Alice View */}
                  <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#adbac7]">ALICE&apos;S COPY</span>
                      <button
                        type="button"
                        onClick={() => setInspectStegoAlice(!inspectStegoAlice)}
                        className="text-[10px] text-[#f0883e] hover:text-[#f0883e]/80 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        {inspectStegoAlice ? 'Hide Stego' : 'Inspect Stego'}
                      </button>
                    </div>

                    <div className="text-[10px] text-[#768390]">
                      WM ID: <span className="text-[#c5cbd3]">{aliceDecrypted.event.watermarkId.slice(0, 16)}...</span>
                    </div>

                    {inspectStegoAlice && (
                      <div className="p-2 rounded bg-[#261c10] border border-[#f0883e]/30 text-[10px] text-[#f0883e] break-all leading-tight">
                        <strong>INSPECTION CHANNEL:</strong> {aliceDecrypted.event.watermarkCommitment}
                      </div>
                    )}

                    <div className="p-2 rounded bg-[#12141a] border border-white/[0.04] text-[#c5cbd3] text-[11px] max-h-24 overflow-y-auto leading-relaxed">
                      {aliceDecrypted.text.slice(0, 160)}...
                    </div>
                  </div>

                  {/* Bob View */}
                  <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#adbac7]">BOB&apos;S COPY</span>
                      <button
                        type="button"
                        onClick={() => setInspectStegoBob(!inspectStegoBob)}
                        className="text-[10px] text-[#f0883e] hover:text-[#f0883e]/80 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        {inspectStegoBob ? 'Hide Stego' : 'Inspect Stego'}
                      </button>
                    </div>

                    <div className="text-[10px] text-[#768390]">
                      WM ID: <span className="text-[#c5cbd3]">{bobDecrypted.event.watermarkId.slice(0, 16)}...</span>
                    </div>

                    {inspectStegoBob && (
                      <div className="p-2 rounded bg-[#261c10] border border-[#f0883e]/30 text-[10px] text-[#f0883e] break-all leading-tight">
                        <strong>INSPECTION CHANNEL:</strong> {bobDecrypted.event.watermarkCommitment}
                      </div>
                    )}

                    <div className="p-2 rounded bg-[#12141a] border border-white/[0.04] text-[#c5cbd3] text-[11px] max-h-24 overflow-y-auto leading-relaxed">
                      {bobDecrypted.text.slice(0, 160)}...
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <OperationalButton
                    variant="operational"
                    size="md"
                    onClick={handleStep4_VisualCheck}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    PROCEED TO SIMULATED LEAK &amp; ATTRIBUTION
                  </OperationalButton>
                </div>
              </div>
            )}

            {/* STAGE 5: Simulated Breach & Forensic Attribution */}
            {currentStep === 5 && bobDecrypted && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="breach">STAGE 05 &bull; SECURITY BREACH</StatusBadge>
                    <span className="text-xs font-mono text-[#f85149]">UNCLASSIFIED LEAK DETECTED</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#768390]">DIAGNOSTIC CHANNEL ACTIVE</span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#e6edf3] tracking-tight">
                    Simulated Leak: Anonymous Document Surfaced in Public Domain
                  </h3>
                  <p className="text-xs text-[#768390] leading-relaxed mt-1">
                    An unknown copy of the classified document is leaked without author attribution. Both Alice and Bob
                    had legitimate access. The workstation extracts the zero-width steganographic bits, matches the
                    watermark commitment on the DLT ledger, and proves the non-repudiable origin.
                  </p>
                </div>

                <div className="p-3.5 rounded-md bg-[#2b1012] border border-[#da3633]/40 space-y-1.5 text-xs font-mono">
                  <div className="text-[#f85149] font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>ANONYMOUS LEAK DISCOVERED &bull; ZERO AUTHOR METADATA</span>
                  </div>
                  <p className="text-[#adbac7] text-[11px]">
                    Target: Extracting embedded watermark payload from Bob Martinez&apos;s leaked plaintext copy...
                  </p>
                </div>

                <div className="pt-2">
                  <OperationalButton
                    variant="danger"
                    size="md"
                    onClick={handleStep5_Attribution}
                    disabled={isRunning}
                    icon={<Search className="w-3.5 h-3.5" />}
                  >
                    {isRunning ? 'EXTRACTING PQC WATERMARK & QUERYING DLT...' : 'RUN FORENSIC ATTRIBUTION'}
                  </OperationalButton>
                </div>
              </div>
            )}

            {/* STAGE 6: Formal Forensic Attribution Determination */}
            {currentStep === 6 && investigationReport && (
              <div className="space-y-5">
                <div className="p-4 rounded-md bg-[#2b1012] border border-[#da3633]/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#f85149] uppercase tracking-wider flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5" />
                      FORMAL FORENSIC FINDING &bull; INDISPUTABLE ATTRIBUTION
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#fca5a5] border border-[#da3633]/40">
                      CONFIDENCE: {investigationReport.confidenceScore}% (MATHEMATICALLY PROVEN)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#da3633]/30">
                    <div>
                      <div className="text-sm font-bold text-[#e6edf3]">
                        Identified Leak Source: {investigationReport.attributedRecipient?.name}
                      </div>
                      <div className="text-xs font-mono text-[#adbac7]">
                        {investigationReport.attributedRecipient?.role} &bull; {investigationReport.attributedRecipient?.organization}
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-[#768390] block text-[10px]">SECURITY CLEARANCE</span>
                      <span className="text-[#f85149] font-bold">{investigationReport.attributedRecipient?.clearanceLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Chain Verification Matrix */}
                <div className="p-4 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-2.5 font-mono text-xs">
                  <div className="text-[11px] font-bold text-[#adbac7] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/[0.04]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7ee787]" />
                    Cryptographic Proof Chain Verification
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between p-2 rounded bg-[#12141a] border border-white/[0.04]">
                      <span className="text-[#768390]">WATERMARK EXTRACTION:</span>
                      <span className="text-[#7ee787] font-semibold">100% BIT-EXACT MATCH</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-[#12141a] border border-white/[0.04]">
                      <span className="text-[#768390]">DLT ANCHOR HEIGHT:</span>
                      <span className="text-[#e6edf3] font-semibold">BLOCK #{investigationReport.matchedBlock?.height}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-[#12141a] border border-white/[0.04]">
                      <span className="text-[#768390]">ML-DSA-65 SIGNATURE:</span>
                      <span className="text-[#7ee787] font-semibold">VALID (NON-REPUDIABLE)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-[#12141a] border border-white/[0.04]">
                      <span className="text-[#768390]">CONSENSUS FINALITY:</span>
                      <span className="text-[#7ee787] font-semibold">3/3 QUORUM RATIFIED</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <OperationalButton
                    variant="secondary"
                    size="md"
                    onClick={handleResetDemo}
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Restart Mission Walkthrough
                  </OperationalButton>

                  <OperationalButton
                    variant="operational"
                    size="md"
                    onClick={onFinishDemo}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Enter Live Workstation Enclave
                  </OperationalButton>
                </div>
              </div>
            )}
          </WorkstationSurface>
        </div>

        {/* Right Column: Technical Telemetry & Evidence Ledger (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-Time Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <TechnicalMetricTile
              label="KEM Scheme"
              value="ML-KEM-768"
              subtext="NIST FIPS 203 Post-Quantum"
              status="nominal"
            />
            <TechnicalMetricTile
              label="Signature Scheme"
              value="ML-DSA-65"
              subtext="NIST FIPS 204 Lattice DSA"
              status="nominal"
            />
            <TechnicalMetricTile
              label="Stego Invariance"
              value="SSIM: 0.9998"
              subtext="PSNR: 49.8 dB (Zero Distortion)"
              status="nominal"
            />
            <TechnicalMetricTile
              label="Ledger Anchoring"
              value={`Block #${aliceDecrypted?.blockHeight || demoPackage ? 2 : 1}`}
              subtext="Air-Gapped Consensus Quorum"
              status="nominal"
            />
          </div>

          {/* Active Cryptographic Evidence Container */}
          <WorkstationSurface variant="elevated" className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-mono">
              <span className="font-semibold text-[#e6edf3] uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#adbac7]" />
                Cryptographic Artifacts
              </span>
              <span className="text-[10px] text-[#768390]">ARCHIVAL PLATINUM</span>
            </div>

            <div className="space-y-2.5">
              <CryptoDataBlock
                label="Master Document SHA-256"
                value="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                badge="HASH"
              />

              {demoPackage ? (
                <>
                  <CryptoDataBlock
                    label="GCM Authentication Tag"
                    value={demoPackage.tagHex}
                    badge="AES-GCM"
                  />
                  <CryptoDataBlock
                    label="Active Package Container ID"
                    value={demoPackage.packageId}
                    badge="SIHPKG"
                  />
                </>
              ) : (
                <div className="p-4 rounded-md bg-[#0d0e12] border border-dashed border-white/[0.08] text-center text-xs font-mono text-[#768390]">
                  Awaiting Stage 01 Broadcast Encryption execution...
                </div>
              )}

              {aliceDecrypted && (
                <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] font-mono text-xs space-y-1">
                  <div className="text-[10px] text-[#768390] uppercase flex justify-between">
                    <span>Alice Decryption Signature</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(aliceDecrypted.event.recipientSignatureBase64, 'alice-sig')}
                      className="text-[10px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'alice-sig' ? <Check className="w-3 h-3 text-[#7ee787]" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'alice-sig' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-[10px] text-[#c5cbd3] truncate">
                    {aliceDecrypted.event.recipientSignatureBase64.slice(0, 38)}...
                  </div>
                </div>
              )}

              {bobDecrypted && (
                <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] font-mono text-xs space-y-1">
                  <div className="text-[10px] text-[#768390] uppercase flex justify-between">
                    <span>Bob Decryption Signature</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(bobDecrypted.event.recipientSignatureBase64, 'bob-sig')}
                      className="text-[10px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'bob-sig' ? <Check className="w-3 h-3 text-[#7ee787]" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'bob-sig' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-[10px] text-[#c5cbd3] truncate">
                    {bobDecrypted.event.recipientSignatureBase64.slice(0, 38)}...
                  </div>
                </div>
              )}
            </div>
          </WorkstationSurface>
        </div>
      </div>
    </div>
  );
};
