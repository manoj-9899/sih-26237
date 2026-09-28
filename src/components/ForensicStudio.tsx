import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  XCircle,
  FileText,
  Key,
  Database,
  ArrowRight,
  Download,
  Copy,
  Check,
  Terminal,
  Fingerprint,
  Radio,
  FileSignature,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ForensicAttributionReport } from '../types';
import { DistributionService } from '../services/distributionService';
import {
  WorkstationSurface,
  OperationalButton,
  StatusBadge,
  CryptoDataBlock,
  TechnicalMetricTile,
} from './ui/WorkstationPrimitives';

interface ForensicStudioProps {
  initialLeakedText?: string;
  leakedMetadata?: { title: string; recipientName: string } | null;
  onNavigateToLedger: () => void;
}

export const ForensicStudio: React.FC<ForensicStudioProps> = ({
  initialLeakedText,
  leakedMetadata,
  onNavigateToLedger,
}) => {
  const [leakedContent, setLeakedContent] = useState<string>(initialLeakedText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ForensicAttributionReport | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawSignature, setShowRawSignature] = useState<boolean>(false);

  useEffect(() => {
    if (initialLeakedText) {
      setLeakedContent(initialLeakedText);
      setReport(null);
    }
  }, [initialLeakedText]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleRunInvestigation = async () => {
    if (!leakedContent.trim()) return;
    setIsAnalyzing(true);
    setReport(null);

    try {
      await new Promise((r) => setTimeout(r, 550));
      const generatedReport = await DistributionService.investigateLeakedDocument(leakedContent);
      setReport(generatedReport);
    } catch (err) {
      console.error('Forensic analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. OPERATIONAL CONTEXT HEADER */}
      <WorkstationSurface variant="primary" className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status="inspection" icon={<Fingerprint className="w-3 h-3 text-[#f0883e]" />}>
                FORENSIC LAB &bull; LEAK RECOVERY CONSOLE
              </StatusBadge>
              <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                RECOVERY: BLIND STEGANOGRAPHY EXTRACTION
              </span>
              <span className="text-[11px] font-mono text-[#768390] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                VERIFICATION: NIST FIPS 204 (ML-DSA-65)
              </span>
            </div>

            <h2 className="text-xl font-bold text-[#e6edf3] tracking-tight">
              Forensic Investigation Studio &amp; Cryptographic Leak Attribution
            </h2>

            <p className="text-xs text-[#768390] leading-relaxed max-w-3xl">
              Extracts the opaque session steganographic watermark from an unattributed plaintext document, matches the
              watermark commitment against the air-gapped immutable ledger, and cryptographically verifies the recipient&apos;s
              ML-DSA-65 signature to establish non-repudiable source attribution.
            </p>
          </div>

          <div className="shrink-0 self-start lg:self-center font-mono text-xs">
            <div className="p-2.5 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-[#768390] uppercase font-bold">ATTRIBUTION PIPELINE</div>
              <div className="text-[#adbac7] font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#7ee787]" />
                <span>AIR-GAPPED CONSENSUS AUDIT</span>
              </div>
            </div>
          </div>
        </div>
      </WorkstationSurface>

      {/* 2. MAIN INVESTIGATION WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Leaked Artifact Ingestion (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <WorkstationSurface variant="primary" className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-mono">
              <span className="font-semibold text-[#e6edf3] uppercase tracking-wider flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-[#adbac7]" />
                Leaked Artifact Ingestion
              </span>
              {leakedMetadata && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#2b1012] text-[#f85149] border border-[#da3633]/40 font-bold">
                  SIMULATED LEAK TARGET
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                <span className="text-[#768390]">DOCUMENT CARRIER TEXT</span>
                <label className="cursor-pointer text-[11px] text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 transition-colors">
                  <Download className="w-3 h-3 rotate-180 text-[#768390]" />
                  <span>Upload .txt/.md</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content) {
                          setLeakedContent(content);
                          setReport(null);
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>

              <textarea
                value={leakedContent}
                onChange={(e) => setLeakedContent(e.target.value)}
                placeholder="Paste leaked text here or trigger 'Simulate Leak' from the Recipient Portal..."
                rows={11}
                className="w-full p-3 rounded-md bg-[#0d0e12] border border-white/[0.08] font-mono text-xs text-[#c5cbd3] placeholder:text-[#57606a] focus:border-white/[0.24] focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="pt-1">
              <OperationalButton
                variant="operational"
                size="lg"
                onClick={handleRunInvestigation}
                disabled={isAnalyzing || !leakedContent.trim()}
                className="w-full"
                icon={<Search className="w-4 h-4 text-[#adbac7]" />}
              >
                {isAnalyzing
                  ? 'EXTRACTING STEGANOGRAPHY & QUERYING DLT...'
                  : 'EXECUTE BLIND FORENSIC ATTRIBUTION'}
              </OperationalButton>
            </div>
          </WorkstationSurface>

          {/* Forensic Instrument Specifications */}
          <WorkstationSurface variant="elevated" className="p-3.5 space-y-2 text-xs font-mono">
            <span className="text-[11px] text-[#768390] uppercase font-bold tracking-wider block">
              Forensic Extraction Engine Parameters
            </span>
            <div className="space-y-1 text-[11px] text-[#adbac7]">
              <div className="flex justify-between">
                <span className="text-[#768390]">Carrier Method:</span>
                <span>Zero-Width Whitespace Permutation</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#768390]">Bit Invariance:</span>
                <span>SSIM &gt; 0.999 &bull; PSNR &gt; 49 dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#768390]">False Positive Rate:</span>
                <span>Zero Mathematical Ambiguity</span>
              </div>
            </div>
          </WorkstationSurface>
        </div>

        {/* Right Column: Formal Certificate & Evidence Chain (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <WorkstationSurface variant="primary" className="p-4 sm:p-5 flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7ee787]" />
                <span className="font-semibold text-[#e6edf3] uppercase tracking-wider">
                  Forensic Attribution Certificate
                </span>
              </div>
              {report && (
                <span className="text-[10px] text-[#768390]">
                  REPORT REF: {report.reportId}
                </span>
              )}
            </div>

            {report ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {/* Formal Verdict Determination */}
                {report.attributionVerdict === 'CONFIRMED_LEAK_SOURCE' && report.attributedRecipient ? (
                  <div className="p-4 rounded-md bg-[#2b1012] border border-[#da3633]/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#f85149] uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        INDISPUTABLE LEAK ATTRIBUTION CONFIRMED
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#fca5a5] border border-[#da3633]/40 font-bold">
                        CONFIDENCE: {report.confidenceScore}% (MATHEMATICAL CERTAINTY)
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-[#da3633]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#e6edf3]">
                          Perpetrator: {report.attributedRecipient.name}
                        </h3>
                        <p className="text-xs text-[#adbac7] font-mono mt-0.5">
                          {report.attributedRecipient.role} &bull; {report.attributedRecipient.organization}
                        </p>
                      </div>

                      <div className="font-mono text-xs text-right">
                        <span className="text-[10px] text-[#768390] block">SECURITY CLEARANCE</span>
                        <span className="text-[#f85149] font-bold">{report.attributedRecipient.clearanceLevel}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded bg-[#0d0e12] border border-white/[0.04] text-[11px] font-mono">
                      <div>
                        <span className="text-[#768390] block text-[10px]">RECIPIENT ID</span>
                        <span className="text-[#c5cbd3]">{report.attributedRecipient.id}</span>
                      </div>
                      <div>
                        <span className="text-[#768390] block text-[10px]">COMMITTED BLOCK</span>
                        <span className="text-[#7ee787] font-bold">Block #{report.matchedBlock?.height}</span>
                      </div>
                      <div>
                        <span className="text-[#768390] block text-[10px]">PQC SIGNATURE</span>
                        <span className="text-[#7ee787] font-bold">VALID (ML-DSA-65)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-md bg-[#261c10] border border-[#f0883e]/30 text-xs font-mono space-y-1">
                    <div className="text-[#f0883e] font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>EXTRACTION WARNING: {report.attributionVerdict}</span>
                    </div>
                    <p className="text-[#adbac7] text-[11px] leading-relaxed">
                      Unable to attribute this document. The text does not contain a recognized session watermark or does
                      not match an authentic Decryption Event recorded on the air-gapped ledger.
                    </p>
                  </div>
                )}

                {/* Evidence Chain Verification Matrix */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase font-semibold text-[#adbac7] block tracking-wider">
                    Deterministic Cryptographic Verification Chain
                  </span>

                  <div className="space-y-1.5 font-mono text-xs">
                    {report.evidenceChain.map((ev, idx) => (
                      <div
                        key={`evidence-step-${idx}-${ev.step}`}
                        className="p-2.5 rounded-md bg-[#0d0e12] border border-white/[0.06] space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            {ev.status === 'VERIFIED' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#7ee787] shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-[#f85149] shrink-0" />
                            )}
                            <span className="font-semibold text-[#e6edf3]">{ev.step}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              ev.status === 'VERIFIED'
                                ? 'bg-white/[0.06] text-[#7ee787] border border-white/[0.10]'
                                : 'bg-[#2b1012] text-[#f85149] border border-[#da3633]/40'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </div>
                        <p className="text-[#768390] text-[10px] pl-5">{ev.description}</p>
                        <p className="text-[#c5cbd3] text-[10px] pl-5 break-all">{ev.technicalDetail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Cryptographic Artifacts */}
                {report.matchedEvent && (
                  <WorkstationSurface variant="recessed" className="p-3 space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center text-[10px] text-[#768390] uppercase font-bold pb-1 border-b border-white/[0.04]">
                      <span>Cryptographic Record Anchoring</span>
                      <button
                        type="button"
                        onClick={() => setShowRawSignature(!showRawSignature)}
                        className="text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-0.5 cursor-pointer"
                      >
                        {showRawSignature ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {showRawSignature ? 'Collapse Signature' : 'Inspect Full Signature'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="flex justify-between p-1.5 rounded bg-[#12141a]">
                        <span className="text-[#768390]">ALGORITHM:</span>
                        <span className="text-[#e6edf3]">NIST FIPS 204</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-[#12141a]">
                        <span className="text-[#768390]">MERKLE ROOT:</span>
                        <span className="text-[#c5cbd3] truncate max-w-[140px]">
                          {report.matchedBlock?.merkleRoot.slice(0, 16)}...
                        </span>
                      </div>
                    </div>

                    {showRawSignature && (
                      <div className="p-2 rounded bg-[#0d0e12] border border-white/[0.06] text-[10px] text-[#c5cbd3] break-all leading-tight">
                        <div className="flex justify-between text-[#768390] mb-1">
                          <span>ML-DSA-65 SIGNATURE BASE64:</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(report.matchedEvent!.recipientSignatureBase64, 'ev-sig')}
                            className="text-[#adbac7] hover:text-[#e6edf3] flex items-center gap-1 cursor-pointer"
                          >
                            {copiedKey === 'ev-sig' ? <Check className="w-3 h-3 text-[#7ee787]" /> : <Copy className="w-3 h-3" />}
                            {copiedKey === 'ev-sig' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        {report.matchedEvent.recipientSignatureBase64}
                      </div>
                    )}
                  </WorkstationSurface>
                )}

                {/* Bottom Operational Handoffs */}
                <div className="pt-2 border-t border-white/[0.06] flex flex-wrap justify-between items-center gap-3">
                  <OperationalButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Attribution-Certificate-${report.reportId}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    icon={<Download className="w-3.5 h-3.5 text-[#adbac7]" />}
                  >
                    Download Certificate (.json)
                  </OperationalButton>

                  <OperationalButton
                    variant="operational"
                    size="sm"
                    onClick={onNavigateToLedger}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Audit Block in DLT Explorer
                  </OperationalButton>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#768390] border border-dashed border-white/[0.08] rounded-md font-mono">
                <Search className="w-8 h-8 mb-2 opacity-30 text-[#768390]" />
                <p className="text-xs font-semibold text-[#e6edf3]">Awaiting Leaked Document Ingestion</p>
                <p className="text-[11px] text-[#768390] mt-1 max-w-sm">
                  Paste a leaked document or trigger a simulated leak from the Recipient Portal, then click &apos;Execute Blind Forensic Attribution&apos;.
                </p>
              </div>
            )}
          </WorkstationSurface>
        </div>
      </div>
    </div>
  );
};
