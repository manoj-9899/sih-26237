import React, { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Database,
  ArrowRight,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import {
  PageShell,
  PageHeader,
  Section,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  VerificationBadge,
  KeyValueRow,
  HashDisplay,
  TechnicalDetails,
} from './ui/designSystem';
import { ForensicAttributionReport } from '../types';
import { DistributionService } from '../services/distributionService';

interface ForensicsViewProps {
  initialLeakedText?: string;
  leakedMetadata?: { title: string; recipientName: string } | null;
  onNavigateToLedger: () => void;
}

export const ForensicsView: React.FC<ForensicsViewProps> = ({
  initialLeakedText,
  leakedMetadata,
  onNavigateToLedger,
}) => {
  const [leakedContent, setLeakedContent] = useState<string>(initialLeakedText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ForensicAttributionReport | null>(null);

  useEffect(() => {
    if (initialLeakedText) {
      setLeakedContent(initialLeakedText);
      setReport(null);
    }
  }, [initialLeakedText]);

  const handleRunAnalysis = async () => {
    if (!leakedContent.trim()) return;

    setIsAnalyzing(true);
    try {
      // Simulate visual scan time for comprehension
      await new Promise((r) => setTimeout(r, 400));
      const result = await DistributionService.investigateLeakedDocument(leakedContent);
      setReport(result);
    } catch (err) {
      console.error('Forensic analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setLeakedContent('');
    setReport(null);
  };

  return (
    <PageShell>
      <PageHeader
        title="Forensic verification"
        description="Upload a leaked document to identify its originating decryption event."
      />

      <div className="space-y-6">
        {/* 1. DOCUMENT DROPZONE & INPUT AREA */}
        <Section title="Suspected leaked document" description="Upload or paste text from an unauthorized document copy.">
          <div className="space-y-4 pt-1">
            {/* Minimal Drop Area */}
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/60 text-center space-y-2">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-xs font-semibold text-slate-800">
                Drop leaked document here or choose a file
              </div>
              <p className="text-[11px] text-slate-500">
                Supports extracted PDF or text files (.pdf, .txt)
              </p>
            </div>

            {/* Document Text Input */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-medium">Document content:</span>
                {leakedMetadata && (
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Loaded leaked copy: {leakedMetadata.title}
                  </span>
                )}
              </div>
              <textarea
                rows={5}
                value={leakedContent}
                onChange={(e) => {
                  setLeakedContent(e.target.value);
                  setReport(null);
                }}
                placeholder="Paste the leaked document text here to scan for steganographic fingerprints..."
                className="w-full p-3.5 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500">
                Scans invisible zero-width Unicode whitespace channels without modifying text.
              </span>

              <div className="flex items-center gap-2">
                {leakedContent && (
                  <SecondaryButton size="sm" onClick={handleClear}>
                    Clear
                  </SecondaryButton>
                )}
                <PrimaryButton
                  size="md"
                  icon={<Search className="w-3.5 h-3.5" />}
                  onClick={handleRunAnalysis}
                  loading={isAnalyzing}
                  disabled={!leakedContent.trim()}
                  data-tour-target="execute-attribution-btn"
                >
                  {isAnalyzing ? 'Analyzing document...' : 'Analyze document'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </Section>

        {/* 2. FORENSIC VERIFICATION RESULT (DOMINATES THE PAGE) */}
        {report && (
          <Section
            title="Forensic verification result"
            description={`Report ID: ${report.reportId} &bull; Generated ${new Date(report.analyzedAt).toLocaleTimeString()}`}
            action={
              <VerificationBadge
                label={
                  report.attributionVerdict === 'CONFIRMED_LEAK_SOURCE'
                    ? 'Origin verified'
                    : 'Unregistered'
                }
              />
            }
          >
            <div className="space-y-6 pt-2">
              {/* Top Verdict Banner */}
              {report.attributionVerdict === 'CONFIRMED_LEAK_SOURCE' && report.attributedRecipient ? (
                <div className="p-5 rounded-xl bg-rose-50/70 border border-rose-200/90 text-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200/60">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      MATCH FOUND &bull; ORIGINATING DECRYPTION IDENTIFIED
                    </span>
                    <span className="text-xs font-mono text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-200 font-semibold">
                      Measured Extraction Confidence: 100%
                    </span>
                  </div>

                  {/* Recipient Profile Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-white rounded-lg border border-rose-200 space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Originating Recipient
                      </span>
                      <div className="text-sm font-bold text-slate-900">
                        {report.attributedRecipient.name}
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        {report.attributedRecipient.role} &bull; {report.attributedRecipient.organization}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-lg border border-rose-200 space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Decryption Event Reference
                      </span>
                      <div className="font-mono font-semibold text-slate-900 text-xs">
                        {report.matchedEvent?.eventId || 'EVT-REGISTERED'}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Ledger block: Block #{report.matchedBlock?.height} &bull; Signed with ML-DSA-65
                      </div>
                    </div>
                  </div>

                  {/* Verification Checkmarks */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Fingerprint matched</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Signature valid</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Ledger verified</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Merkle root intact</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    No matching provenance record found
                  </span>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The document did not contain a valid session watermark or its watermark commitment does not match any committed transaction on the ledger.
                  </p>
                </div>
              )}

              {/* Step-by-Step Evidence Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-900 block">
                  Forensic evidence chain:
                </span>
                <div className="space-y-2">
                  {report.evidenceChain.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{ev.step}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 pl-5.5">{ev.description}</div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 pl-5.5 sm:pl-0 sm:text-right">
                        {ev.technicalDetail}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progressive Disclosure of Cryptographic Proofs */}
              <TechnicalDetails title="View Merkle inclusion proof &amp; raw cryptographic values">
                {report.watermarkPayload && (
                  <>
                    <KeyValueRow label="Recovered Session UUID" value={report.watermarkPayload.sessionId} copyable />
                    <KeyValueRow label="Watermark Identifier" value={report.watermarkPayload.watermarkId} copyable />
                    <KeyValueRow label="Recipient Key Fingerprint" value={report.watermarkPayload.recipientFingerprint} copyable />
                  </>
                )}
                {report.matchedBlock && (
                  <>
                    <KeyValueRow label="Block Hash (SHA-256)" value={report.matchedBlock.blockHash} copyable />
                    <KeyValueRow label="Merkle Root" value={report.matchedBlock.merkleRoot} copyable />
                    <KeyValueRow label="Validator Attestations" value={`${report.matchedBlock.validatorSignatures.length}/4 Quorum Attested`} mono={false} />
                  </>
                )}
              </TechnicalDetails>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <SecondaryButton
                  size="sm"
                  icon={<Database className="w-3.5 h-3.5" />}
                  onClick={onNavigateToLedger}
                >
                  Inspect event in Ledger
                </SecondaryButton>
              </div>
            </div>
          </Section>
        )}
      </div>
    </PageShell>
  );
};
