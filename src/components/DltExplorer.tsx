import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Radio,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileCode,
  Lock,
  Flame,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  Fingerprint,
} from 'lucide-react';
import { LedgerBlock, ValidatorNode, UiMode } from '../types';
import { airGappedLedger } from '../ledger/dlt';
import { GuidancePanel } from './ui/GuidancePanel';
import {
  WorkstationSurface,
  OperationalButton,
  StatusBadge,
  CryptoDataBlock,
  TechnicalMetricTile,
} from './ui/WorkstationPrimitives';

interface DltExplorerProps {
  onRefreshNeeded: () => void;
  uiMode?: UiMode;
}

export const DltExplorer: React.FC<DltExplorerProps> = ({
  onRefreshNeeded,
  uiMode = 'workstation',
}) => {
  const [chain, setChain] = useState<LedgerBlock[]>([]);
  const [validators, setValidators] = useState<ValidatorNode[]>([]);
  const [selectedBlockHeight, setSelectedBlockHeight] = useState<number>(0);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    isValid: boolean;
    totalBlocksChecked: number;
    totalTransactionsChecked: number;
    tamperDetected?: {
      blockHeight: number;
      reason: string;
      fieldExpected: string;
      fieldFound: string;
    };
  } | null>(null);

  const [isTampered, setIsTampered] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadLedgerData = () => {
    const rawChain = airGappedLedger.getChain();
    setChain(rawChain);
    setValidators(airGappedLedger.getValidators());
    if (rawChain.length > 0 && selectedBlockHeight === 0) {
      setSelectedBlockHeight(rawChain[rawChain.length - 1].height);
    }
  };

  useEffect(() => {
    loadLedgerData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    await new Promise((r) => setTimeout(r, 450));
    const result = await airGappedLedger.verifyLedgerIntegrity();
    setAuditResult(result);
    setIsAuditing(false);
  };

  const handleSimulateTamper = () => {
    if (chain.length <= 1) return;
    const success = airGappedLedger.simulateAdminTamperAttack(1, 'USR-CHARLIE-CHEN-03');
    if (success) {
      setIsTampered(true);
      loadLedgerData();
      handleRunAudit();
    }
  };

  const handleRestoreLedger = () => {
    setIsTampered(false);
    loadLedgerData();
    setAuditResult(null);
    onRefreshNeeded();
  };

  const selectedBlock = chain.find((b) => b.height === selectedBlockHeight) || chain[chain.length - 1];

  return (
    <div className="space-y-5">
      {/* Guided Mode Guidance Panel */}
      {uiMode === 'guided' && (
        <GuidancePanel
          stepNumber="4"
          title="Air-Gapped Immutable DLT & Cryptographic Anti-Tamper Auditor"
          summary="Traditional databases can be silently altered by rogue system administrators to erase access logs. This system anchors every Decryption Event into a distributed ledger protected by SHA-256 block hash chaining, Merkle roots, and a 3/3 validator quorum."
          recommendedAction="Click 'AUDIT ENTIRE CHAIN' to verify cryptographic integrity. Then click 'Simulate Tamper' to watch the audit engine catch unauthorized edits."
          whatToObserve="When tampering occurs, the hash chain breaks and the auditor flags the exact block height (#1) and field mismatch."
          actionButtonLabel="Audit Entire Chain"
          onActionClick={handleRunAudit}
        />
      )}

      {/* 1. OPERATIONAL CONTEXT HEADER */}
      <WorkstationSurface variant="primary" className="p-3.5 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="nominal" icon={<Database className="w-3 h-3 text-[#adbac7]" />}>
              IMMUTABLE DLT CONSOLE
            </StatusBadge>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              3/3 BFT QUORUM
            </span>
            <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
              MERKLE + SHA-256
            </span>
            <span className="text-[11px] font-mono text-[#7ee787] px-2 py-0.5 rounded bg-[#7ee787]/10 border border-[#7ee787]/20">
              HEIGHT: #{chain.length}
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <OperationalButton
              variant={isTampered ? 'danger' : 'operational'}
              size="sm"
              onClick={handleRunAudit}
              disabled={isAuditing}
              icon={<ShieldCheck className="w-3 h-3" />}
            >
              {isAuditing ? 'AUDITING...' : 'AUDIT ENTIRE CHAIN'}
            </OperationalButton>

            {!isTampered ? (
              <OperationalButton
                variant="danger"
                size="sm"
                onClick={handleSimulateTamper}
                icon={<AlertTriangle className="w-3 h-3" />}
              >
                Simulate Tamper
              </OperationalButton>
            ) : (
              <OperationalButton
                variant="operational"
                size="sm"
                onClick={handleRestoreLedger}
                icon={<RotateCcw className="w-3 h-3" />}
              >
                Restore Quorum
              </OperationalButton>
            )}
          </div>
        </div>
      </WorkstationSurface>

      {/* 2. VALIDATOR QUORUM TOPOLOGY BAR */}
      <WorkstationSurface variant="elevated" className="p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#7ee787]" />
            <span className="font-semibold text-[#e6edf3] uppercase tracking-wider">
              Validator Node Quorum Status
            </span>
          </div>
          <span className="text-[11px] text-[#7ee787] flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7ee787]" />
            3/3 Air-Gapped Nodes In Quorum
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {validators.map((val) => (
            <div
              key={val.id}
              className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e6edf3]">{val.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-[#7ee787] border border-white/[0.08]">
                  {val.status}
                </span>
              </div>
              <p className="text-[11px] text-[#768390]">{val.role}</p>
              <div className="text-[10px] text-[#57606a] flex justify-between pt-1 border-t border-white/[0.04]">
                <span>Enclave: {val.location}</span>
                <span>Ratified: {chain.length} Blocks</span>
              </div>
            </div>
          ))}
        </div>
      </WorkstationSurface>

      {/* 3. AUDIT CONTROL BAR & TAMPER BENCH */}
      <WorkstationSurface variant="primary" className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#e6edf3] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#7ee787]" />
              Cryptographic Chain Audit &amp; Anti-Tamper Verification
            </h4>
            <p className="text-[11px] text-[#768390] font-mono leading-tight">
              Verifies block hash chaining, Merkle roots, validator signatures, and recipient non-repudiation across the entire ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <OperationalButton
              variant="operational"
              size="sm"
              onClick={handleRunAudit}
              disabled={isAuditing}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />}
            >
              {isAuditing ? 'Auditing Ledger...' : 'Audit Entire Chain'}
            </OperationalButton>

            {chain.length > 1 && !isTampered && (
              <OperationalButton
                variant="danger"
                size="sm"
                onClick={handleSimulateTamper}
                icon={<Flame className="w-3.5 h-3.5 text-[#f85149]" />}
              >
                Simulate Rogue Admin Tamper
              </OperationalButton>
            )}

            {isTampered && (
              <OperationalButton
                variant="secondary"
                size="sm"
                onClick={handleRestoreLedger}
                icon={<RotateCcw className="w-3.5 h-3.5 text-[#7ee787]" />}
              >
                Restore Quorum Integrity
              </OperationalButton>
            )}
          </div>
        </div>

        {/* Audit Result Banner */}
        {auditResult && (
          <div
            className={`p-3.5 rounded-md border text-xs font-mono space-y-1.5 ${
              auditResult.isValid
                ? 'bg-[#12141a] border-white/[0.14] text-[#adbac7]'
                : 'bg-[#2b1012] border-[#da3633]/50 text-[#fca5a5]'
            }`}
          >
            <div className="flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-2">
                {auditResult.isValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#7ee787]" />
                    <span className="text-[#e6edf3]">LEDGER INTEGRITY VERIFIED: 100% UNTAMPERED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-[#f85149]" />
                    <span className="text-[#f85149]">CRITICAL ALERT: ROGUE RECORD TAMPERING DETECTED!</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-[#768390]">
                {auditResult.totalBlocksChecked} Blocks &bull; {auditResult.totalTransactionsChecked} Transactions Verified
              </span>
            </div>

            {auditResult.tamperDetected && (
              <div className="p-2.5 rounded bg-black/40 border border-[#da3633]/40 space-y-1 text-[11px]">
                <div className="text-[#f85149] font-bold">
                  Tampering Location: Block #{auditResult.tamperDetected.blockHeight}
                </div>
                <div className="text-[#c5cbd3]">Reason: {auditResult.tamperDetected.reason}</div>
                <div className="text-[#768390] truncate">
                  Expected Hash: {auditResult.tamperDetected.fieldExpected}
                </div>
                <div className="text-[#fca5a5] truncate">
                  Calculated Hash: {auditResult.tamperDetected.fieldFound}
                </div>
              </div>
            )}
          </div>
        )}
      </WorkstationSurface>

      {/* 4. BLOCK EXPLORER WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Committed Blocks Rail (col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <WorkstationSurface variant="primary" className="p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06] text-xs font-mono">
              <span className="font-semibold text-[#adbac7] uppercase tracking-wider">
                Committed Blocks ({chain.length})
              </span>
              <span className="text-[10px] text-[#768390]">SELECT TO INSPECT</span>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {chain.map((blk) => {
                const isSelected = blk.height === selectedBlockHeight;
                return (
                  <div
                    key={`block-${blk.height}-${blk.blockHash}`}
                    onClick={() => setSelectedBlockHeight(blk.height)}
                    className={`p-2.5 rounded-md border cursor-pointer font-mono select-none transition-all ${
                      isSelected
                        ? 'border-white/[0.28] bg-[#1f242d] text-[#e6edf3]'
                        : 'border-white/[0.06] bg-[#0d0e12] text-[#adbac7] hover:border-white/[0.14] hover:bg-[#12141a]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#e6edf3]">Block #{blk.height}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.05] text-[#7ee787]">
                        {blk.transactions.length} Tx{blk.transactions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#768390] mt-1 truncate">
                      Hash: {blk.blockHash.slice(0, 20)}...
                    </div>
                    <div className="text-[9px] text-[#57606a] mt-0.5">
                      {new Date(blk.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </WorkstationSurface>
        </div>

        {/* Right Column: Detailed Block & Transaction Inspector (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedBlock ? (
            <WorkstationSurface variant="primary" className="p-4 sm:p-5 space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-base font-bold text-[#e6edf3]">
                    Block #{selectedBlock.height} Inspector
                  </h3>
                  <span className="text-[11px] text-[#768390]">
                    Committed Timestamp: {new Date(selectedBlock.timestamp).toUTCString()}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[#adbac7] text-xs font-semibold self-start sm:self-center">
                  {selectedBlock.transactions.length} Provenance Transactions
                </span>
              </div>

              {/* Cryptographic Hashes Container */}
              <div className="space-y-1.5 p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] text-[11px]">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#768390] uppercase font-bold shrink-0">BLOCK HASH:</span>
                  <span className="text-[#c5cbd3] break-all">{selectedBlock.blockHash}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#768390] uppercase font-bold shrink-0">PREVIOUS HASH:</span>
                  <span className="text-[#768390] break-all">{selectedBlock.previousHash}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#768390] uppercase font-bold shrink-0">MERKLE ROOT:</span>
                  <span className="text-[#adbac7] break-all">{selectedBlock.merkleRoot}</span>
                </div>
              </div>

              {/* Validator Signatures Attestations */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#adbac7] uppercase tracking-wider block">
                  Validator Quorum Attestations ({selectedBlock.validatorSignatures.length}/3 Signed)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedBlock.validatorSignatures.map((vs) => (
                    <div
                      key={vs.validatorId}
                      className="p-2.5 rounded bg-[#0d0e12] border border-white/[0.06] text-[10px] space-y-1"
                    >
                      <div className="font-semibold text-[#e6edf3]">{vs.validatorName}</div>
                      <div className="text-[#768390] truncate">Sig: {vs.signatureHex.slice(0, 18)}...</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decryption Events / Transactions */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <span className="text-[11px] font-bold text-[#adbac7] uppercase tracking-wider block">
                  Decryption Events in Block ({selectedBlock.transactions.length})
                </span>

                {selectedBlock.transactions.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedBlock.transactions.map((tx) => (
                      <div
                        key={tx.eventId}
                        className="p-3 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-2 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#e6edf3]">{tx.eventId}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-[#adbac7] border border-white/[0.08]">
                            {tx.signatureAlgorithm}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#768390]">
                          <div>
                            Recipient: <strong className="text-[#e6edf3]">{tx.recipientName}</strong>
                          </div>
                          <div>
                            Session UUID: <span className="text-[#c5cbd3]">{tx.sessionId}</span>
                          </div>
                          <div>
                            Doc Hash: <span className="text-[#768390]">{tx.documentHashSha256.slice(0, 16)}...</span>
                          </div>
                          <div>
                            Watermark ID: <strong className="text-[#adbac7]">{tx.watermarkId}</strong>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/[0.04] text-[#768390] text-[10px] flex items-center justify-between">
                          <span className="truncate max-w-[280px]">
                            ML-DSA-65 Sig: {tx.recipientSignatureBase64.slice(0, 36)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.recipientSignatureBase64, tx.eventId)}
                            className="text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === tx.eventId ? <Check className="w-3 h-3 text-[#7ee787]" /> : <Copy className="w-3 h-3 text-[#768390]" />}
                            {copiedKey === tx.eventId ? 'Copied' : 'Copy Sig'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#0d0e12] border border-white/[0.06] text-center text-[#768390]">
                    Genesis Block &mdash; System Initializer (No user transactions)
                  </div>
                )}
              </div>
            </WorkstationSurface>
          ) : (
            <div className="p-8 text-center text-[#768390] font-mono text-xs">
              Select a block from the list to inspect
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
