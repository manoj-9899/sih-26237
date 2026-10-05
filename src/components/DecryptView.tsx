import React, { useState } from 'react';
import {
  Unlock,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  FileText,
  FileCheck,
  ArrowRight,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  PageShell,
  PageHeader,
  Section,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  StatusBadge,
  VerificationBadge,
  KeyValueRow,
  TechnicalDetails,
  EmptyState,
} from './ui/designSystem';
import { Recipient, EncryptedPackage, DecryptionEvent, WatermarkPayload } from '../types';
import { DistributionService } from '../services/distributionService';

interface DecryptViewProps {
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

export const DecryptView: React.FC<DecryptViewProps> = ({
  recipients,
  activePackage,
  onDecryptionSuccess,
  onSimulateLeak,
  onNavigateToForensics,
  onNavigateToLedger,
}) => {
  // Current active local identity (Defaults to Alice Vance)
  const [currentRecipientId, setCurrentRecipientId] = useState<string>(
    recipients[0]?.id || 'USR-ALICE-VANCE-01'
  );

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedResult, setDecryptedResult] = useState<{
    watermarkedText: string;
    decryptionEvent: DecryptionEvent;
    watermarkPayload: WatermarkPayload;
    blockHeight: number;
  } | null>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [showStegoChannel, setShowStegoChannel] = useState(false);

  const currentRecipient =
    recipients.find((r) => r.id === currentRecipientId) || recipients[0];

  const hasEnvelope = activePackage?.envelopes.some(
    (e) => e.recipientId === currentRecipient?.id
  );

  const handleExecuteDecryption = async () => {
    if (!activePackage || !currentRecipient || !hasEnvelope) return;

    setIsDecrypting(true);
    setActiveStep(1);

    try {
      // Simulate sequential visual steps for comprehension
      await new Promise((r) => setTimeout(r, 200));
      setActiveStep(2);
      await new Promise((r) => setTimeout(r, 200));
      setActiveStep(3);
      await new Promise((r) => setTimeout(r, 200));
      setActiveStep(4);

      const result = await DistributionService.executeRecipientDecryption(
        activePackage,
        currentRecipient
      );

      setDecryptedResult(result);
      onDecryptionSuccess({
        recipient: currentRecipient,
        watermarkedText: result.watermarkedText,
        decryptionEvent: result.decryptionEvent,
        watermarkPayload: result.watermarkPayload,
        blockHeight: result.blockHeight,
      });
    } catch (err: any) {
      console.error('Decryption failed:', err);
    } finally {
      setIsDecrypting(false);
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

  const handleDownloadCopy = () => {
    if (!decryptedResult || !activePackage) return;
    const blob = new Blob([decryptedResult.watermarkedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePackage.documentTitle.replace(/\s+/g, '_')}_Decrypted_${currentRecipient.avatarInitials}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell>
      <PageHeader
        title="Decrypt document"
        description="Decrypt locally and create a signed provenance record."
        badge={
          <StatusBadge status="verified" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
            Local session active
          </StatusBadge>
        }
      />

      {/* 1. SESSION IDENTITY CONTEXT & IDENTITY SWITCHER */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 shrink-0">
            {currentRecipient?.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-normal">Signed in as</span>
              <strong className="text-slate-900 font-semibold">{currentRecipient?.name}</strong>
              <span className="text-[10px] text-slate-400">({currentRecipient?.role})</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Identity verified &bull; Keystore active &bull; Clearance: {currentRecipient?.clearanceLevel}
            </div>
          </div>
        </div>

        {/* Identity Demo Switcher */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <span className="text-[11px] text-slate-400">Switch identity:</span>
          <select
            value={currentRecipientId}
            onChange={(e) => {
              setCurrentRecipientId(e.target.value);
              setDecryptedResult(null);
              setShowStegoChannel(false);
            }}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. DOCUMENT READY STATUS & PRE-DECRYPTION CHECKLIST */}
      {activePackage ? (
        <Section
          title="Document ready for decryption"
          description={activePackage.documentTitle}
          action={
            hasEnvelope ? (
              <VerificationBadge label="Decryption authorized" />
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                Not authorized
              </span>
            )
          }
        >
          <div className="space-y-4 pt-1">
            {/* Document metadata line */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px]">Classification:</span>
                <div className="font-semibold text-slate-900">{activePackage.classification}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px]">Envelopes in package:</span>
                <div className="font-semibold text-slate-900">{activePackage.envelopes.length} Recipients</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[11px]">Sender:</span>
                <div className="font-semibold text-slate-900">{activePackage.senderName}</div>
              </div>
            </div>

            {/* Before you continue checklist */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-semibold text-slate-900 block">
                Before you continue:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Decrypted in local security environment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Unique forensic fingerprint created</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Decryption event digitally signed (ML-DSA-65)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Provenance recorded in tamper-evident ledger</span>
                </div>
              </div>
            </div>

            {/* Decrypt Action Button */}
            {!decryptedResult && (
              <div className="pt-2 flex justify-end">
                <PrimaryButton
                  size="lg"
                  icon={<Unlock className="w-4 h-4" />}
                  onClick={handleExecuteDecryption}
                  loading={isDecrypting}
                  disabled={!hasEnvelope}
                  data-tour-target="decrypt-recipient-btn"
                >
                  {isDecrypting ? 'Executing decryption pipeline...' : 'Decrypt document'}
                </PrimaryButton>
              </div>
            )}

            {/* Live Progress indicator during decryption */}
            {isDecrypting && (
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Decrypting document...</span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {activeStep === 1 && '1/4 Recovering key via ML-KEM-768 decapsulation...'}
                  {activeStep === 2 && '2/4 Decrypting AES-256-GCM ciphertext in memory...'}
                  {activeStep === 3 && '3/4 Embedding invisible forensic fingerprint...'}
                  {activeStep === 4 && '4/4 Signing decryption event with ML-DSA-65 & committing to ledger...'}
                </div>
              </div>
            )}

            {/* 3. POST-DECRYPTION SUCCESS VIEWPORT */}
            {decryptedResult && (
              <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-150">
                {/* Completion summary banner */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      Decryption complete &bull; Provenance recorded
                    </div>
                    <div className="text-emerald-800 text-[11px] mt-0.5">
                      Forensic fingerprint: <span className="font-mono font-semibold">{decryptedResult.watermarkPayload.watermarkId}</span> &bull; Ledger: <span className="font-mono">Block #{decryptedResult.blockHeight}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SecondaryButton
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5 text-slate-500" />}
                      onClick={() => setShowStegoChannel(!showStegoChannel)}
                    >
                      {showStegoChannel ? 'Hide watermark' : 'Inspect watermark'}
                    </SecondaryButton>

                    <SecondaryButton
                      size="sm"
                      icon={<Download className="w-3.5 h-3.5 text-slate-500" />}
                      onClick={handleDownloadCopy}
                    >
                      Download copy
                    </SecondaryButton>
                  </div>
                </div>

                {/* Inspect Stego Channel Accordion Box */}
                {showStegoChannel && (
                  <div className="p-3 bg-sky-50/80 border border-sky-200 rounded-lg text-xs space-y-1.5 font-mono text-sky-950">
                    <div className="font-semibold flex items-center justify-between">
                      <span>STEGANOGRAPHIC WATERMARK DETAILS</span>
                      <span className="text-[10px] text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                        DIAGNOSTIC VIEW
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>Session UUID: {decryptedResult.watermarkPayload.sessionId}</div>
                      <div>Watermark ID: {decryptedResult.watermarkPayload.watermarkId}</div>
                      <div>Fingerprint: {decryptedResult.watermarkPayload.recipientFingerprint}</div>
                      <div>Timestamp: {new Date(decryptedResult.watermarkPayload.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <p className="text-[11px] text-sky-800 pt-1 font-sans">
                      The document text displayed below is visually 100% normal. The watermark is encoded steganographically using zero-width Unicode characters.
                    </p>
                  </div>
                )}

                {/* Decrypted Document Text Viewport */}
                <div className="p-5 bg-white border border-slate-200 rounded-xl text-xs font-mono leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text shadow-2xs">
                  {decryptedResult.watermarkedText}
                </div>

                {/* Actions Bar & Leak Simulation Trigger */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500">
                    Document bound to {currentRecipient.name}&apos;s verified identity.
                  </span>

                  <div className="flex items-center gap-2">
                    <DangerButton
                      size="sm"
                      icon={<AlertTriangle className="w-3.5 h-3.5" />}
                      onClick={handleTriggerLeak}
                      data-tour-target="simulate-leak-btn"
                    >
                      Simulate anonymous leak of {currentRecipient.name}&apos;s copy
                    </DangerButton>
                  </div>
                </div>

                {/* Technical details disclosure */}
                <TechnicalDetails title="Signed decryption receipt &amp; ledger proof">
                  <KeyValueRow label="Event ID" value={decryptedResult.decryptionEvent.eventId} />
                  <KeyValueRow label="Watermark Commitment" value={decryptedResult.decryptionEvent.watermarkCommitment} copyable />
                  <KeyValueRow label="Recipient Signature (ML-DSA-65)" value={decryptedResult.decryptionEvent.recipientSignatureBase64.slice(0, 48) + '...'} copyable />
                  <KeyValueRow label="Committed Ledger Block" value={`Block #${decryptedResult.blockHeight}`} />
                  <div className="pt-2 text-[11px] text-slate-500">
                    This decryption event was ratified by all validator nodes and committed permanently to the local air-gapped ledger.
                  </div>
                </TechnicalDetails>
              </div>
            )}
          </div>
        </Section>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No distribution package ready"
          description="Go to Documents to select a document and encrypt it for authorized recipients."
          action={
            <SecondaryButton size="sm" onClick={onNavigateToForensics}>
              Go to Documents
            </SecondaryButton>
          }
        />
      )}
    </PageShell>
  );
};
