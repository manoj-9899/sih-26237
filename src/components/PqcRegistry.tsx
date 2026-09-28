import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  FileCheck,
  Fingerprint,
  Radio,
} from 'lucide-react';
import { Recipient, UiMode } from '../types';
import { generateRecipientPqcKeys, bytesToHex } from '../crypto/pqc';
import { GuidancePanel } from './ui/GuidancePanel';
import {
  WorkstationSurface,
  OperationalButton,
  StatusBadge,
  CryptoDataBlock,
  TechnicalMetricTile,
} from './ui/WorkstationPrimitives';

interface PqcRegistryProps {
  recipients: Recipient[];
  uiMode?: UiMode;
}

export const PqcRegistry: React.FC<PqcRegistryProps> = ({ recipients, uiMode = 'workstation' }) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(recipients[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKeyResult, setGeneratedKeyResult] = useState<{
    kemPubKeyHex: string;
    dsaPubKeyHex: string;
    fingerprint: string;
    generationTimeMs: number;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const selectedRecipient = recipients.find((r) => r.id === selectedRecipientId) || recipients[0];

  const handleGenerateLivePqcKeys = async () => {
    setIsGenerating(true);
    const start = performance.now();
    try {
      const keys = await generateRecipientPqcKeys();
      const elapsed = performance.now() - start;

      setGeneratedKeyResult({
        kemPubKeyHex: bytesToHex(keys.kemPublicKey),
        dsaPubKeyHex: bytesToHex(keys.dsaPublicKey),
        fingerprint: keys.fingerprint,
        generationTimeMs: Math.round(elapsed),
      });
    } catch (err) {
      console.error('PQC generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Guided Mode Guidance Panel */}
      {uiMode === 'guided' && (
        <GuidancePanel
          stepNumber="5"
          title="Post-Quantum Cryptographic Identity Directory & Live Key Synthesizer"
          summary="NIST finalized post-quantum standards in August 2024 to withstand quantum attacks. This directory holds registered ML-KEM-768 (FIPS 203) keys for confidential envelope wrapping and ML-DSA-65 (FIPS 204) keys for non-repudiable digital signatures."
          recommendedAction="Click on an enrolled personnel profile on the left to inspect their public keys, or click 'Synthesize Live PQC Keypair' to generate an authentic lattice keypair in WebAssembly memory."
          whatToObserve="Notice that public keys are larger than legacy RSA (1,184 bytes for ML-KEM and 1,952 bytes for ML-DSA) and mathematically resist quantum factorization."
          actionButtonLabel="Synthesize Keypair"
          onActionClick={handleGenerateLivePqcKeys}
        />
      )}

      {/* 1. OPERATIONAL CONTEXT HEADER */}
      <WorkstationSurface variant="primary" className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="nominal" icon={<KeyRound className="w-3 h-3 text-[#adbac7]" />}>
              PQC REGISTRY
            </StatusBadge>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              ML-KEM-768 (FIPS 203)
            </span>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              ML-DSA-65 (FIPS 204)
            </span>
            <span className="text-[11px] font-mono text-[#7ee787] px-2 py-0.5 rounded bg-[#7ee787]/10 border border-[#7ee787]/20">
              {recipients.length} KEYSTORES
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <OperationalButton
              variant="operational"
              size="sm"
              onClick={handleGenerateLivePqcKeys}
              disabled={isGenerating}
              icon={<Cpu className="w-3 h-3" />}
            >
              {isGenerating ? 'SYNTHESIZING...' : 'SYNTHESIZE LIVE PQC KEYPAIR'}
            </OperationalButton>
          </div>
        </div>
      </WorkstationSurface>

      {/* 2. REGISTRY WORKBENCH GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Enrolled Personnel Directory (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <WorkstationSurface variant="primary" className="p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06] text-xs font-mono">
              <span className="font-semibold text-[#adbac7] uppercase tracking-wider">
                Enrolled Personnel Keystores
              </span>
              <span className="text-[10px] text-[#768390]">ACTIVE STORE</span>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {recipients.map((recip) => {
                const isSelected = recip.id === selectedRecipientId;
                return (
                  <div
                    key={recip.id}
                    onClick={() => setSelectedRecipientId(recip.id)}
                    className={`p-2.5 rounded-md border cursor-pointer select-none transition-all ${
                      isSelected
                        ? 'border-white/[0.28] bg-[#1f242d] text-[#e6edf3]'
                        : 'border-white/[0.06] bg-[#0d0e12] text-[#adbac7] hover:border-white/[0.14] hover:bg-[#12141a]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-bold text-xs font-mono text-[#adbac7]">
                        {recip.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-semibold text-[#e6edf3] truncate">{recip.name}</h5>
                          <span className="text-[10px] text-[#7ee787] font-mono">ENROLLED</span>
                        </div>
                        <p className="text-[10px] text-[#768390] truncate font-mono">{recip.role}</p>
                        <div className="text-[9px] text-[#57606a] font-mono truncate mt-0.5">
                          FP: {recip.keys.keyFingerprint}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </WorkstationSurface>

          {/* Live NIST Keypair Generator */}
          <WorkstationSurface variant="elevated" className="p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#e6edf3] font-mono uppercase">
              <Cpu className="w-3.5 h-3.5 text-[#adbac7]" />
              <span>Live Post-Quantum Key Generator</span>
            </div>
            <p className="text-[11px] text-[#768390] font-mono leading-tight">
              Synthesizes an authentic NIST FIPS 203 &amp; 204 lattice keypair directly in client WebAssembly memory.
            </p>
            <OperationalButton
              variant="operational"
              size="sm"
              onClick={handleGenerateLivePqcKeys}
              disabled={isGenerating}
              className="w-full"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />}
            >
              {isGenerating ? 'Generating Lattice Keys...' : 'Generate Authentic PQC Keypair'}
            </OperationalButton>

            {generatedKeyResult && (
              <div className="p-2 rounded bg-[#0d0e12] border border-white/[0.06] text-[10px] font-mono space-y-1 mt-2">
                <div className="flex justify-between text-[#7ee787] font-bold">
                  <span>GENERATED IN {generatedKeyResult.generationTimeMs}ms</span>
                  <span>AUTHENTIC</span>
                </div>
                <div className="text-[#768390] truncate">
                  Fingerprint: {generatedKeyResult.fingerprint}
                </div>
              </div>
            )}
          </WorkstationSurface>
        </div>

        {/* Right Column: Credential Detail & Key Inspector (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <WorkstationSurface variant="primary" className="p-4 sm:p-5 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-[#e6edf3]">
                  {selectedRecipient.name} &mdash; Enclave Credential Profile
                </h3>
                <span className="text-[11px] text-[#768390]">
                  PERSONNEL ID: {selectedRecipient.id} &bull; {selectedRecipient.organization}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[#7ee787] text-xs font-semibold self-start sm:self-center">
                ACTIVE &bull; {selectedRecipient.clearanceLevel}
              </span>
            </div>

            {/* Structured Cryptographic Key Envelopes */}
            <div className="space-y-3">
              {/* ML-KEM-768 Public Key */}
              <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#adbac7] uppercase">
                    NIST FIPS 203 &bull; ML-KEM-768 Public Key (1,184 Bytes)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedRecipient.keys.kemPublicKeyHex, 'kem')}
                    className="text-[10px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'kem' ? <Check className="w-3 h-3 text-[#7ee787]" /> : <Copy className="w-3 h-3 text-[#768390]" />}
                    {copiedKey === 'kem' ? 'Copied' : 'Copy Hex'}
                  </button>
                </div>
                <div className="text-[10px] text-[#c5cbd3] break-all max-h-16 overflow-y-auto leading-relaxed p-1.5 rounded bg-[#12141a]">
                  {selectedRecipient.keys.kemPublicKeyHex}
                </div>
              </div>

              {/* ML-DSA-65 Public Key */}
              <div className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#adbac7] uppercase">
                    NIST FIPS 204 &bull; ML-DSA-65 Public Key (1,952 Bytes)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedRecipient.keys.dsaPublicKeyHex, 'dsa')}
                    className="text-[10px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'dsa' ? <Check className="w-3 h-3 text-[#7ee787]" /> : <Copy className="w-3 h-3 text-[#768390]" />}
                    {copiedKey === 'dsa' ? 'Copied' : 'Copy Hex'}
                  </button>
                </div>
                <div className="text-[10px] text-[#c5cbd3] break-all max-h-16 overflow-y-auto leading-relaxed p-1.5 rounded bg-[#12141a]">
                  {selectedRecipient.keys.dsaPublicKeyHex}
                </div>
              </div>

              {/* Fingerprint & Keystore Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] flex justify-between items-center">
                  <span className="text-[#768390]">PUBLIC KEY FINGERPRINT:</span>
                  <span className="text-[#e6edf3] font-bold">{selectedRecipient.keys.keyFingerprint}</span>
                </div>
                <div className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] flex justify-between items-center">
                  <span className="text-[#768390]">ENROLLMENT STATUS:</span>
                  <span className="text-[#7ee787] font-semibold">VERIFIED HARDWARE ATTESTATION</span>
                </div>
              </div>

              <div className="p-3 rounded-md bg-[#12141a] border border-white/[0.06] text-[11px] text-[#768390] leading-relaxed">
                <strong className="text-[#adbac7]">Security Notice:</strong> Private key components are protected
                under simulated client hardware keystores and never leave local device boundaries. Broadcasters only
                require these published public keys to encapsulate symmetric document keys.
              </div>
            </div>
          </WorkstationSurface>
        </div>
      </div>
    </div>
  );
};
