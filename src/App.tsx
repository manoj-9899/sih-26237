/**
 * Main Application Component:
 * Post-Quantum Cryptographic Attribution and Immutable Decryption Provenance System.
 * Refined Swiss & Cryptographic Laboratory Light Workstation with Beginner-Friendly Guided Tour.
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ActiveTab } from './components/Navbar';
import { SenderStudio } from './components/SenderStudio';
import { RecipientPortal } from './components/RecipientPortal';
import { ForensicStudio } from './components/ForensicStudio';
import { DltExplorer } from './components/DltExplorer';
import { PqcRegistry } from './components/PqcRegistry';
import { WalkthroughTab } from './components/WalkthroughTab';
import { SecurityTestHarness } from './components/SecurityTestHarness';
import { GuidedTourIntroModal } from './components/guided/GuidedTourIntroModal';
import { FloatingMissionGuide } from './components/guided/FloatingMissionGuide';
import { TOUR_STEPS } from './types/tour';
import {
  SAMPLE_DOCUMENTS,
  initializeRecipientsAndLedger,
} from './data/sampleData';
import { Recipient, EncryptedPackage, ClassifiedDocument, UiMode } from './types';
import { airGappedLedger } from './ledger/dlt';
import { DistributionService } from './services/distributionService';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('walkthrough');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [uiMode, setUiMode] = useState<UiMode>(() => {
    const saved = localStorage.getItem('sih26237_ui_mode');
    return saved === 'guided' ? 'guided' : 'guided'; // default to guided for welcoming beginners
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [documents, setDocuments] = useState<ClassifiedDocument[]>(SAMPLE_DOCUMENTS);
  const [activePackage, setActivePackage] = useState<EncryptedPackage | null>(null);
  const [leakedText, setLeakedText] = useState<string>('');
  const [leakedMeta, setLeakedMeta] = useState<{ title: string; recipientName: string } | null>(null);
  const [blocksCount, setBlocksCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Guided Tour State
  const [showIntroModal, setShowIntroModal] = useState<boolean>(() => {
    const hasSeen = localStorage.getItem('sih26237_has_seen_tour_intro');
    return !hasSeen;
  });
  const [tourStepId, setTourStepId] = useState<number>(1);
  const [tourActive, setTourActive] = useState<boolean>(true);

  const handleToggleUiMode = (mode: UiMode) => {
    setUiMode(mode);
    localStorage.setItem('sih26237_ui_mode', mode);
    if (mode === 'guided') {
      setTourActive(true);
    }
  };

  const handleAddDocument = (newDoc: ClassifiedDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleResetSession = () => {
    setActivePackage(null);
    setLeakedText('');
    setLeakedMeta(null);
  };

  // Initialize PQC keys and Genesis block
  useEffect(() => {
    const init = async () => {
      try {
        const recips = await initializeRecipientsAndLedger();
        setRecipients(recips);
        setBlocksCount(airGappedLedger.getChain().length);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Visual Spotlight Manager based on active tour step
  useEffect(() => {
    if (!tourActive || uiMode !== 'guided') {
      // Remove any leftover spotlights
      document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
        el.classList.remove('tour-spotlight-active');
      });
      return;
    }

    const currentStep = TOUR_STEPS.find((s) => s.id === tourStepId);
    if (!currentStep || !currentStep.highlightSelector) return;

    // Small delay to ensure tab DOM nodes are mounted
    const timeout = setTimeout(() => {
      document.querySelectorAll('.tour-spotlight-active').forEach((el) => {
        el.classList.remove('tour-spotlight-active');
      });

      const targetEl = document.querySelector(currentStep.highlightSelector!);
      if (targetEl) {
        targetEl.classList.add('tour-spotlight-active');
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [tourActive, tourStepId, activeTab, uiMode]);

  const refreshBlocksCount = () => {
    setBlocksCount(airGappedLedger.getChain().length);
  };

  const handleSimulateLeak = (
    text: string,
    metadata: { title: string; recipientName: string }
  ) => {
    setLeakedText(text);
    setLeakedMeta(metadata);
  };

  const handleStartTourFromIntro = () => {
    setShowIntroModal(false);
    localStorage.setItem('sih26237_has_seen_tour_intro', 'true');
    setUiMode('guided');
    setTourActive(true);
    setTourStepId(1);
    setActiveTab('sender');
  };

  const handleDismissIntroModal = () => {
    setShowIntroModal(false);
    localStorage.setItem('sih26237_has_seen_tour_intro', 'true');
  };

  // 1-Click Failsafe Auto-Execution for whichever step the beginner is on
  const handleAutoExecuteCurrentStep = async () => {
    const alice = recipients.find((r) => r.id === 'USR-ALICE-VANCE-01') || recipients[0];
    const bob = recipients.find((r) => r.id === 'USR-BOB-MARTINEZ-02') || recipients[1];
    const doc = documents[0];

    try {
      if (tourStepId === 1) {
        // Step 1: Create package with Alice & Bob
        const pkg = await DistributionService.createEncryptedPackage(doc, [alice, bob]);
        setActivePackage(pkg);
        setTourStepId(2);
        setActiveTab('recipient');
      } else if (tourStepId === 2) {
        // Step 2: Ensure package exists and decrypt for Alice
        let pkg = activePackage;
        if (!pkg) {
          pkg = await DistributionService.createEncryptedPackage(doc, [alice, bob]);
          setActivePackage(pkg);
        }
        await DistributionService.executeRecipientDecryption(pkg, alice);
        refreshBlocksCount();
        setTourStepId(3);
        setActiveTab('recipient');
      } else if (tourStepId === 3) {
        // Step 3: Decrypt for Bob and leak
        let pkg = activePackage;
        if (!pkg) {
          pkg = await DistributionService.createEncryptedPackage(doc, [alice, bob]);
          setActivePackage(pkg);
        }
        const bRes = await DistributionService.executeRecipientDecryption(pkg, bob);
        refreshBlocksCount();
        handleSimulateLeak(bRes.watermarkedText, {
          title: pkg.documentTitle,
          recipientName: bob.name,
        });
        setTourStepId(4);
        setActiveTab('forensics');
      } else if (tourStepId === 4) {
        // Step 4: Run forensics
        setTourStepId(5);
        setActiveTab('ledger');
      } else if (tourStepId === 5) {
        // Step 5: Finished
        setActiveTab('walkthrough');
      }
    } catch (e) {
      console.error('Auto-execute error:', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-mono space-y-4">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-xs font-semibold tracking-wider text-slate-700 uppercase">
          INITIALIZING POST-QUANTUM CRYPTOGRAPHIC ENCLAVE...
        </div>
        <p className="text-xs text-slate-500 font-sans">
          Loading NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) Keystores
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-indigo-500/15 selection:text-indigo-950 font-sans antialiased">
      {/* Beginner Welcome Briefing Modal */}
      <GuidedTourIntroModal
        isOpen={showIntroModal}
        onStartTour={handleStartTourFromIntro}
        onDismiss={handleDismissIntroModal}
      />

      {/* Collapsible Left Navigation Sidebar with Persistent Telemetry */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blocksCount={blocksCount}
        uiMode={uiMode}
        onToggleUiMode={handleToggleUiMode}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Viewport Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {/* Modern Top Context Bar */}
        <TopBar
          activeTab={activeTab}
          activePackage={activePackage}
          blocksCount={blocksCount}
          onResetSession={handleResetSession}
        />

        {/* Workspace Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'walkthrough' && (
            <WalkthroughTab
              documents={documents}
              recipients={recipients}
              onFinishDemo={() => {
                setActiveTab('sender');
                setTourStepId(1);
              }}
              uiMode={uiMode}
            />
          )}

          {activeTab === 'sender' && (
            <SenderStudio
              documents={documents}
              recipients={recipients}
              activePackage={activePackage}
              onPackageCreated={(pkg) => {
                setActivePackage(pkg);
                // Advance tour to Chapter 2
                if (tourActive) {
                  setTourStepId(2);
                }
              }}
              onNavigateToRecipient={() => {
                setActiveTab('recipient');
                setTourStepId(2);
              }}
              onAddDocument={handleAddDocument}
              uiMode={uiMode}
            />
          )}

          {activeTab === 'recipient' && (
            <RecipientPortal
              recipients={recipients}
              activePackage={activePackage}
              onDecryptionSuccess={() => {
                refreshBlocksCount();
              }}
              onSimulateLeak={(txt, meta) => {
                handleSimulateLeak(txt, meta);
                // Advance tour to Chapter 4 (Forensics)
                if (tourActive) {
                  setTourStepId(4);
                }
              }}
              onNavigateToForensics={() => {
                setActiveTab('forensics');
                setTourStepId(4);
              }}
              onNavigateToLedger={() => {
                setActiveTab('ledger');
                setTourStepId(5);
              }}
              uiMode={uiMode}
            />
          )}

          {activeTab === 'forensics' && (
            <ForensicStudio
              initialLeakedText={leakedText}
              leakedMetadata={leakedMeta}
              onNavigateToLedger={() => {
                setActiveTab('ledger');
                setTourStepId(5);
              }}
              uiMode={uiMode}
            />
          )}

          {activeTab === 'ledger' && (
            <DltExplorer onRefreshNeeded={refreshBlocksCount} uiMode={uiMode} />
          )}

          {activeTab === 'pqc' && <PqcRegistry recipients={recipients} uiMode={uiMode} />}

          {activeTab === 'security' && <SecurityTestHarness recipients={recipients} uiMode={uiMode} />}
        </main>

        {/* Floating Detective Mission Guide Companion */}
        {uiMode === 'guided' && tourActive && (
          <FloatingMissionGuide
            currentStepId={tourStepId}
            onSelectStep={(sId) => setTourStepId(sId)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onCloseTour={() => setTourActive(false)}
            onAutoExecuteCurrentStep={handleAutoExecuteCurrentStep}
            activePackageAvailable={activePackage !== null}
            leakedTextAvailable={leakedText.length > 0}
          />
        )}

        {/* Clean Laboratory Workstation Footer */}
        <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-slate-600">
              AEGIS-PQC &bull; Defense Provenance & Forensic Attribution Enclave
            </span>
            <span className="text-slate-400">
              NIST FIPS 203 (ML-KEM-768) &bull; NIST FIPS 204 (ML-DSA-65) &bull; Air-Gapped DLT Quorum
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
