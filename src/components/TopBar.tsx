import React from 'react';
import {
  Shield,
  Layers,
  Lock,
  Cpu,
  RotateCcw,
  Sparkles,
  FileCheck,
  Package,
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { EncryptedPackage } from '../types';

interface TopBarProps {
  activeTab: ActiveTab;
  activePackage: EncryptedPackage | null;
  blocksCount: number;
  onResetSession: () => void;
  onLoadSamplePackage?: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  walkthrough: {
    title: 'Mission Control',
    subtitle: 'Interactive detective story and real-time security tracking',
  },
  sender: {
    title: 'Sender Enclave',
    subtitle: 'Lock files in a quantum-proof safe with separate keys for each recipient',
  },
  recipient: {
    title: 'Recipient Portal',
    subtitle: 'Unlock secret documents and inspect invisible watermarks',
  },
  forensics: {
    title: 'Forensic Studio',
    subtitle: 'Scan leaked files under a digital blacklight to identify the source',
  },
  ledger: {
    title: 'Air-Gapped Ledger',
    subtitle: 'Tamper-proof history book synchronized across 3 independent computers',
  },
  pqc: {
    title: 'PQC Key Registry',
    subtitle: 'Quantum-safe cryptographic keys protecting each user identity',
  },
  security: {
    title: 'Security Stress Lab',
    subtitle: '7 automated cyber attack simulations proving system defenses',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  activePackage,
  blocksCount,
  onResetSession,
}) => {
  const current = TAB_TITLES[activeTab] || {
    title: 'Cryptographic Workstation',
    subtitle: 'Air-Gapped Provenance Enclave',
  };

  return (
    <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          {current.title}
        </h1>
        <span className="text-slate-300 font-light">/</span>
        <span className="text-xs text-slate-500 font-normal truncate hidden md:inline">
          {current.subtitle}
        </span>
      </div>

      {/* Right Controls & Package Quick Status */}
      <div className="flex items-center gap-3">
        {activePackage ? (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-md text-[11px] font-mono text-emerald-800">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{activePackage.documentTitle}</span>
            <span className="text-emerald-500">·</span>
            <span className="text-emerald-700">
              {activePackage.envelopes.length} Envelopes
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-mono text-slate-500">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span>No Active Package</span>
          </div>
        )}

        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
          <button
            onClick={onResetSession}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
            title="Reset active cryptographic enclave state"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Reset Enclave</span>
          </button>
        </div>
      </div>
    </header>
  );
};
