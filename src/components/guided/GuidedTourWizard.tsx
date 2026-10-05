import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Shield,
  Lightbulb,
  Check,
  Minimize2,
  Maximize2,
  X,
  Target,
  Wand2,
} from 'lucide-react';
import { TourStep, TOUR_STEPS } from '../../types/tour';
import { ActiveTab } from '../Navbar';

interface GuidedTourWizardProps {
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onAutoExecuteCurrentStep?: () => void;
  onResetTour: () => void;
  onCloseTour: () => void;
  isStepActionCompleted: boolean;
}

export const GuidedTourWizard: React.FC<GuidedTourWizardProps> = ({
  currentStepIndex,
  onStepChange,
  onNavigateTab,
  onAutoExecuteCurrentStep,
  onResetTour,
  onCloseTour,
  isStepActionCompleted,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const step = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      onStepChange(nextIndex);
      onNavigateTab(TOUR_STEPS[nextIndex].tab);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      onStepChange(prevIndex);
      onNavigateTab(TOUR_STEPS[prevIndex].tab);
      setShowExplanation(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border border-indigo-500 font-medium text-xs transition-all hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Resume Guided Tour ({step.badge})</span>
          <Maximize2 className="w-3.5 h-3.5 opacity-80" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-96 max-w-[calc(100vw-2.5rem)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-200/90 overflow-hidden transition-all duration-300 font-sans">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 text-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-amber-400 text-indigo-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {step.chapterNumber}
          </div>
          <div className="truncate">
            <span className="text-[10px] font-mono tracking-wider uppercase text-amber-300 font-semibold block leading-none">
              GUIDED MISSION &bull; {step.badge}
            </span>
            <h3 className="text-xs font-bold text-white truncate mt-0.5">
              {step.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Minimize guide"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCloseTour}
            className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            title="Exit tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress dots bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50/70 border-b border-indigo-100">
        {TOUR_STEPS.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => {
              onStepChange(idx);
              onNavigateTab(s.tab);
            }}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentStepIndex
                ? 'w-8 bg-indigo-600'
                : idx < currentStepIndex
                ? 'w-4 bg-emerald-500'
                : 'w-4 bg-slate-200 hover:bg-slate-300'
            }`}
            title={`Jump to ${s.title}`}
          />
        ))}
      </div>

      {/* Body content */}
      <div className="p-4 space-y-3.5 max-h-[60vh] overflow-y-auto">
        {/* Story Goal */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wide">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>The Detective Story</span>
          </div>
          <p className="leading-relaxed">{step.storyGoal}</p>
        </div>

        {/* Action Checklist */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase font-mono">
            <span>What to do right now</span>
            {isStepActionCompleted && (
              <span className="text-emerald-700 flex items-center gap-1 text-[10px] font-bold">
                <Check className="w-3 h-3 text-emerald-600" /> Done!
              </span>
            )}
          </div>
          <div className="space-y-1.5 text-xs text-slate-700">
            {step.actionInstructions.map((inst, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80"
              >
                <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="leading-snug">{inst}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What is happening in plain English? */}
        <div className="pt-1">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-mono">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              {showExplanation ? 'Hide simple explanation' : 'How does this work? (Plain English)'}
            </span>
            <span className="text-xs">{showExplanation ? '▲' : '▼'}</span>
          </button>

          {showExplanation && (
            <div className="mt-2 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-200">
              <p>
                <strong className="text-indigo-950 font-semibold block mb-0.5">Under the hood:</strong>
                {step.backgroundExplanation}
              </p>
              <p className="text-[11px] text-slate-500 border-t border-indigo-100/80 pt-1.5">
                <strong className="text-slate-700 font-semibold">Why this matters: </strong>
                {step.whyItMatters}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer action bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          disabled={isFirstStep}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-200/60 font-medium transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {onAutoExecuteCurrentStep && !isStepActionCompleted && (
          <button
            onClick={onAutoExecuteCurrentStep}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-lg font-medium transition-colors cursor-pointer"
            title="Click to automatically perform this step for you"
          >
            <Wand2 className="w-3 h-3 text-indigo-600" />
            <span>Do it for me</span>
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={isLastStep}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer ${
            isStepActionCompleted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <span>{isLastStep ? 'Mission Completed!' : 'Next Step'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
