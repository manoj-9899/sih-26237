import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface GuidancePanelProps {
  stepNumber?: number | string;
  title: string;
  summary: string;
  recommendedAction?: string;
  whatToObserve?: string;
  onActionClick?: () => void;
  actionButtonLabel?: string;
  defaultExpanded?: boolean;
}

export const GuidancePanel: React.FC<GuidancePanelProps> = ({
  stepNumber,
  title,
  summary,
  recommendedAction,
  whatToObserve,
  onActionClick,
  actionButtonLabel,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="rounded-lg border border-cyan-500/30 bg-[#0c141d]/90 p-3.5 text-xs text-[#adbac7] shadow-sm backdrop-blur-sm transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-mono font-bold text-cyan-300">
            {stepNumber ? stepNumber : <Sparkles className="h-3 w-3" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                GUIDED ENCLAVE ASSISTANT
              </span>
              <span className="text-white/20">&bull;</span>
              <h3 className="font-semibold text-[#e6edf3] text-xs font-sans tracking-tight">
                {title}
              </h3>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-[#768390] hover:text-[#e6edf3] hover:bg-white/[0.05] transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Minimize Guide' : 'Expand Guide'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-cyan-500/15 space-y-2.5 text-[11px] leading-relaxed">
          <p className="text-[#adbac7]">{summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {recommendedAction && (
              <div className="p-2.5 rounded bg-black/30 border border-cyan-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold text-[10px] uppercase">
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  Recommended Action
                </div>
                <div className="text-[#e6edf3]">{recommendedAction}</div>
              </div>
            )}

            {whatToObserve && (
              <div className="p-2.5 rounded bg-black/30 border border-white/[0.08] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold text-[10px] uppercase">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  What to Observe
                </div>
                <div className="text-[#adbac7]">{whatToObserve}</div>
              </div>
            )}
          </div>

          {actionButtonLabel && onActionClick && (
            <div className="pt-1 flex justify-end">
              <button
                onClick={onActionClick}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
              >
                <span>{actionButtonLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
