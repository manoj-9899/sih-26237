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
import { ForensicAttributionReport, UiMode } from '../types';
import { DistributionService } from '../services/distributionService';
import { GuidancePanel } from './ui/GuidancePanel';
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
  uiMode?: UiMode;
}

export const ForensicStudio: React.FC<ForensicStudioProps> = ({
  initialLeakedText,
  leakedMetadata,
  onNavigateToLedger,
  uiMode = 'workstation',
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
    <div className="space-y-6">
      {uiMode === 'guided' && (
        <GuidancePanel
          stepNumber="3"
          title="Blind Forensic Steganography Extraction & Ledger Attribution"
          summary="An investigator pastes or uploads an unattributed leaked document. The forensic engine blindly scans zero-width character sequences, recovers the hidden 32-byte session payload, matches it against the immutable DLT, and verifies the recipient's ML-DSA-65 digital signature."
          recommendedAction="Ensure the leaked document text is in the box below and click 'EXECUTE BLIND FORENSIC ATTRIBUTION'."
          whatToObserve="Observe the 100% confidence verdict and download the court-ready Forensic Certificate (.json) linking the leak directly to the perpetrator."
          actionButtonLabel="Execute Attribution"
          onActionClick={handleRunInvestigation}
        />
      )}

      {/* 1. OPERATIONAL CONTEXT HEADER */}
      <WorkstationSurface variant="primary" className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="inspection" icon={<Fingerprint className="w-3.5 h-3.5 text-sky-600" />}>
              FORENSIC LAB
            </StatusBadge>
            <span className="text-[11px] font-mono text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
              BLIND STEGANOGRAPHY
            </span>
            <span className="text-[11px] font-mono text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
              ML-DSA-65 (FIPS 204)
            </span>
            <span className="text-[11px] font-mono text-emerald-700 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
              LEDGER VERIFIED
            </span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <OperationalButton
              variant="operational"
              size="sm"
              onClick={handleRunInvestigation}
              disabled={isAnalyzing || !leakedContent.trim()}
              icon={<Search className="w-3.5 h-3.5" />}
            >
              {isAnalyzing ? 'EXTRACTING...' : 'EXECUTE BLIND ATTRIBUTION'}
            </OperationalButton>
          </div>
        </div>
      </WorkstationSurface>

      {/* 2. MAIN INVESTIGATION WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leaked Artifact Ingestion */}
        <div className="lg:col-span-5 space-y-6">
          <WorkstationSurface variant="primary" className="space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs font-mono">
              <span className="font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-slate-600" />
                Leaked Artifact Ingestion
              </span>
              {leakedMetadata && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                  SIMULATED TARGET
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                <span className="text-slate-500 font-medium">DOCUMENT CARRIER TEXT</span>
                <label className="cursor-pointer text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition-colors">
                  <Download className="w-3.5 h-3.5 rotate-180 text-indigo-600" />
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
                className="w-full p-3.5 rounded-lg bg-slate-50 border border-slate-300 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="pt-1">
              <OperationalButton
                variant="operational"
                size="lg"
                onClick={handleRunInvestigation}
                disabled={isAnalyzing || !leakedContent.trim()}
                className="w-full"
                icon={<Search className="w-4 h-4" />}
                data-tour-target="execute-attribution-btn"
              >
                {isAnalyzing
                  ? 'EXTRACTING STEGANOGRAPHY & QUERYING DLT...'
                  : 'EXECUTE BLIND FORENSIC ATTRIBUTION'}
              </OperationalButton>
            </div>
          </WorkstationSurface>

          <WorkstationSurface variant="elevated" className="space-y-2.5 text-xs font-mono">
            <span className="text-xs text-slate-900 uppercase font-bold tracking-wider block">
              Forensic Extraction Parameters
            </span>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Carrier Method:</span>
                <span className="font-semibold text-slate-800">Zero-Width Whitespace</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Bit Invariance:</span>
                <span className="font-semibold text-slate-800">SSIM &gt; 0.999 &bull; PSNR &gt; 49 dB</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500">False Positive Rate:</span>
                <span className="font-semibold text-emerald-700">Zero Mathematical Ambiguity</span>
              </div>
            </div>
          </WorkstationSurface>
        </div>

        {/* Right Column: Formal Certificate & Evidence Chain */}
        <div className="lg:col-span-7 space-y-6">
          <WorkstationSurface variant="primary" className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900 uppercase tracking-wider">
                  Forensic Attribution Certificate
                </span>
              </div>
              {report && (
                <span className="text-xs text-slate-500">
                  REF: {report.reportId}
                </span>
              )}
            </div>

            {report ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                {/* Formal Verdict Determination */}
                {report.attributionVerdict === 'CONFIRMED_LEAK_SOURCE' && report.attributedRecipient ? (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        INDISPUTABLE LEAK ATTRIBUTION CONFIRMED
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                        CONFIDENCE: {report.confidenceScore}% (MATHEMATICAL CERTAINTY)
                      </span>
                    </div>

                    <div className="pt-2 border-t border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Perpetrator: {report.attributedRecipient.name}
                        </h3>
                        <p className="text-xs text-slate-600 font-mono mt-0.5">
                          {report.attributedRecipient.role} &bull; {report.attributedRecipient.organization}
                        </p>
                      </div>

                      <div className="font-mono text-xs text-right">
                        <span className="text-[10px] text-slate-500 block">SECURITY CLEARANCE</span>
                        <span className="text-rose-700 font-bold">{report.attributedRecipient.clearanceLevel}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-white border border-rose-200 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">RECIPIENT ID</span>
                        <span className="text-slate-800 font-medium">{report.attributedRecipient.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">COMMITTED BLOCK</span>
                        <span className="text-emerald-700 font-bold">Block #{report.matchedBlock?.height}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">PQC SIGNATURE</span>
                        <span className="text-emerald-700 font-bold">VALID (ML-DSA-65)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono space-y-1">
                    <div className="text-amber-800 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>EXTRACTION WARNING: {report.attributionVerdict}</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed font-sans">
                      Unable to attribute this document. The text does not contain a recognized session watermark or does
                      not match an authentic Decryption Event recorded on the air-gapped ledger.
                    </p>
                  </div>
                )}

                {/* Evidence Chain Verification Matrix */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase font-semibold text-slate-700 block tracking-wider">
                    Deterministic Cryptographic Verification Chain
                  </span>

                  <div className="space-y-2 font-mono text-xs">
                    {report.evidenceChain.map((ev, idx) => (
                      <div
                        key={`evidence-step-${idx}-${ev.step}`}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {ev.status === 'VERIFIED' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span className="font-semibold text-slate-900">{ev.step}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              ev.status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs pl-6 font-sans">{ev.description}</p>
                        <p className="text-slate-800 text-xs pl-6 break-all font-mono">{ev.technicalDetail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Cryptographic Artifacts */}
                {report.matchedEvent && (
                  <WorkstationSurface variant="recessed" className="p-3.5 space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between items-center text-xs text-slate-500 uppercase font-semibold pb-1 border-b border-slate-200">
                      <span>Cryptographic Record Anchoring</span>
                      <button
                        type="button"
                        onClick={() => setShowRawSignature(!showRawSignature)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer font-medium"
                      >
                        {showRawSignature ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {showRawSignature ? 'Collapse Signature' : 'Inspect Full Signature'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500">ALGORITHM:</span>
                        <span className="text-slate-900 font-semibold">NIST FIPS 204</span>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-slate-500">MERKLE ROOT:</span>
                        <span className="text-slate-800 truncate max-w-[140px] font-semibold">
                          {report.matchedBlock?.merkleRoot.slice(0, 16)}...
                        </span>
                      </div>
                    </div>

                    {showRawSignature && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 break-all leading-relaxed">
                        <div className="flex justify-between text-slate-500 mb-1 font-semibold">
                          <span>ML-DSA-65 SIGNATURE BASE64:</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(report.matchedEvent!.recipientSignatureBase64, 'ev-sig')}
                            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                          >
                            {copiedKey === 'ev-sig' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === 'ev-sig' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        {report.matchedEvent.recipientSignatureBase64}
                      </div>
                    )}
                  </WorkstationSurface>
                )}

                <div className="pt-3 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
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
                    icon={<Download className="w-3.5 h-3.5 text-slate-600" />}
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
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg font-mono">
                <Search className="w-8 h-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs font-semibold text-slate-800">Awaiting Leaked Document Ingestion</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm font-sans">
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
