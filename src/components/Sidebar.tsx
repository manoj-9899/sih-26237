import React from 'react';
import {
  Shield,
  Layers,
  Send,
  Download,
  Search,
  Database,
  KeyRound,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Radio,
  Lock,
  Compass,
  Cpu,
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { UiMode } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  blocksCount: number;
  uiMode: UiMode;
  onToggleUiMode: (mode: UiMode) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  blocksCount,
  uiMode,
  onToggleUiMode,
  collapsed,
  onToggleCollapse,
}) => {
  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'walkthrough' as ActiveTab,
          label: 'Mission Control',
          subtext: 'Interactive detective story',
          icon: Compass,
        },
      ],
    },
    {
      title: 'ENCLAVES',
      items: [
        {
          id: 'sender' as ActiveTab,
          label: 'Sender Studio',
          subtext: 'Lock files for multiple users',
          icon: Send,
        },
        {
          id: 'recipient' as ActiveTab,
          label: 'Recipient Portal',
          subtext: 'Unlock & stamp watermarks',
          icon: Download,
        },
      ],
    },
    {
      title: 'INTELLIGENCE & PROVENANCE',
      items: [
        {
          id: 'forensics' as ActiveTab,
          label: 'Forensic Lab',
          subtext: 'Scan leaks & catch leaker',
          icon: Search,
        },
        {
          id: 'ledger' as ActiveTab,
          label: 'Air-Gapped Ledger',
          subtext: 'Tamper-proof history book',
          icon: Database,
          badge: `Block #${blocksCount}`,
        },
      ],
    },
    {
      title: 'SECURITY HARNESS',
      items: [
        {
          id: 'pqc' as ActiveTab,
          label: 'PQC Registry',
          subtext: 'Quantum-safe key manager',
          icon: KeyRound,
        },
        {
          id: 'security' as ActiveTab,
          label: 'Security Stress Lab',
          subtext: '7 simulated cyber attacks',
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-200 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 border-b border-slate-200 flex items-center justify-between px-3.5 bg-white">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                AEGIS-PQC
                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded font-semibold border border-indigo-100">
                  NIST FIPS
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono tracking-tight truncate">
                Air-Gapped Provenance
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {navSections.map((sec, secIdx) => (
          <div key={secIdx}>
            {!collapsed && (
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                {sec.title}
              </div>
            )}
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title={collapsed ? `${item.label} — ${item.subtext}` : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {item.subtext}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Persistent Bottom Enclave Status HUD */}
      {!collapsed ? (
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 space-y-2.5">
          {/* Node Quorum & Enclave Boundary */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Air-Gap Boundary
              </span>
              <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                ISOLATED
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>DLT Quorum</span>
              <span className="text-slate-700 font-medium">3/3 Nodes Online</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-slate-200/70 rounded-md">
            <button
              onClick={() => onToggleUiMode('guided')}
              className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                uiMode === 'guided'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Guided Tour
            </button>
            <button
              onClick={() => onToggleUiMode('workstation')}
              className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                uiMode === 'workstation'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workstation
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-200 flex flex-col items-center gap-2">
          <div
            className="w-2 h-2 rounded-full bg-emerald-500"
            title="Air-Gap Enclave: Isolated (3/3 Quorum Online)"
          />
        </div>
      )}
    </aside>
  );
};
