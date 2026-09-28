import React from 'react';
import {
  Shield,
  Lock,
  Layers,
  Cpu,
  Radio,
  Send,
  Download,
  Search,
  Database,
  KeyRound,
  PlayCircle,
  ShieldAlert,
} from 'lucide-react';

import { UiMode } from '../types';

export type ActiveTab =
  | 'walkthrough'
  | 'sender'
  | 'recipient'
  | 'forensics'
  | 'ledger'
  | 'pqc'
  | 'security';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  blocksCount: number;
  uiMode: UiMode;
  onToggleUiMode: (mode: UiMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  blocksCount,
  uiMode,
  onToggleUiMode,
}) => {
  return (
    <header className="border-b border-white/[0.08] bg-[#0d0f14]/95 backdrop-blur-md sticky top-0 z-50">
      {/* 1. Tactical Security Telemetry Sub-bar */}
      <div className="bg-[#090a0d] border-b border-white/[0.05] px-4 py-1.5 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[#768390]">
          {/* Enclave Operational Boundary Status */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#7ee787]"></span>
            <span className="font-semibold text-[#adbac7] tracking-wider uppercase text-[11px]">
              SECURE ENCLAVE
            </span>
            <span className="text-white/[0.15]">&bull;</span>
            <span className="text-[#57606a] text-[11px] uppercase tracking-wide">
              AIR-GAPPED &bull; ZERO OUTBOUND NETWORK EGRESS
            </span>
          </div>

          {/* Cryptographic Subsystem Health */}
          <div className="flex items-center gap-5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#768390]" />
              <span className="text-[#57606a]">KMS:</span>
              <strong className="text-[#adbac7] font-semibold">LOCAL ENCLAVE</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-[#768390]" />
              <span className="text-[#57606a]">POST-QUANTUM:</span>
              <strong className="text-[#adbac7] font-semibold">FIPS 203 / 204</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#768390]" />
              <span className="text-[#57606a]">CONSENSUS:</span>
              <strong className="text-[#adbac7] font-semibold">3/3 QUORUM</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Console Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Workstation Authority Branding */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-[#161b22] border border-white/[0.10] text-[#c5cbd3]">
            <Shield className="w-5 h-5 text-[#c5cbd3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#e6edf3] tracking-tight font-sans">
                Post-Quantum Cryptographic Provenance Workstation
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-[#768390] border border-white/[0.08]">
                AIR-GAPPED DLT
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#57606a]">
              Multi-Recipient Broadcast Encrypt &middot; Dynamic Stego Watermarking &middot; Non-Repudiation
            </p>
          </div>
        </div>

        {/* Global UI Mode Switcher */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="flex items-center p-0.5 rounded-lg bg-[#07080a] border border-white/[0.12] text-xs font-mono select-none">
            <button
              onClick={() => onToggleUiMode('workstation')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                uiMode === 'workstation'
                  ? 'bg-[#1f242d] text-[#e6edf3] font-semibold shadow-sm border border-white/[0.14]'
                  : 'text-[#768390] hover:text-[#adbac7]'
              }`}
              title="Workstation Mode: Clean, data-dense interface with zero educational clutter"
            >
              <Cpu className="w-3 h-3 text-[#7ee787]" />
              <span>WORKSTATION</span>
            </button>
            <button
              onClick={() => onToggleUiMode('guided')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                uiMode === 'guided'
                  ? 'bg-cyan-950/80 text-cyan-300 font-semibold shadow-sm border border-cyan-500/40'
                  : 'text-[#768390] hover:text-cyan-400'
              }`}
              title="Guided Mode: Step-by-step guidance panels, hints, and plain-English workflow explanations"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>GUIDED MODE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Operational Tab Navigation System */}
      <div className="max-w-7xl mx-auto px-4 pb-2.5">
        <nav className="flex items-center gap-1 p-1 rounded-lg bg-[#0a0b0d] border border-white/[0.08] overflow-x-auto">
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'walkthrough'
                ? 'bg-[#1f242d] text-[#e6edf3] border border-white/[0.18] font-semibold'
                : 'text-[#768390] hover:text-[#adbac7] hover:bg-white/[0.04]'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Mission Demo</span>
          </button>

          <button
            onClick={() => setActiveTab('sender')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sender'
                ? 'bg-[#1f242d] text-[#e6edf3] border border-white/[0.18] font-semibold'
                : 'text-[#768390] hover:text-[#adbac7] hover:bg-white/[0.04]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sender Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('recipient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'recipient'
                ? 'bg-[#1f242d] text-[#e6edf3] border border-white/[0.18] font-semibold'
                : 'text-[#768390] hover:text-[#adbac7] hover:bg-white/[0.04]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Recipient Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('forensics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'forensics'
                ? 'bg-[#1f242d] text-[#e6edf3] border border-white/[0.18] font-semibold'
                : 'text-[#768390] hover:text-[#adbac7] hover:bg-white/[0.04]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Forensic Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-[#1f242d] text-[#e6edf3] border border-white/[0.18] font-semibold'
                : 'text-[#768390] hover:text-[#adbac7] hover:bg-white/[0.04]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DLT Explorer</span>
            <span className="ml-1 text-[10px] font-mono px-1 py-0.2 rounded bg-white/[0.08] text-[#adbac7]">
              #{blocksCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pqc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pqc'
                ? 'bg-[#1f242d] text-[#e6edf3] border border-white/[0.18] font-semibold'
                : 'text-[#768390] hover:text-[#adbac7] hover:bg-white/[0.04]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PQC Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#2b1012] text-[#f85149] border border-red-500/30 font-semibold'
                : 'text-[#768390] hover:text-[#f85149] hover:bg-red-500/05'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Attack Lab</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
