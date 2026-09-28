/**
 * Main Application Component:
 * Post-Quantum Cryptographic Attribution and Immutable Decryption Provenance System.
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { SenderStudio } from './components/SenderStudio';
import { RecipientPortal } from './components/RecipientPortal';
import { ForensicStudio } from './components/ForensicStudio';
import { DltExplorer } from './components/DltExplorer';
import { PqcRegistry } from './components/PqcRegistry';
import { WalkthroughTab } from './components/WalkthroughTab';
import { SecurityTestHarness } from './components/SecurityTestHarness';
import {
  SAMPLE_DOCUMENTS,
  initializeRecipientsAndLedger,
} from './data/sampleData';
import { Recipient, EncryptedPackage, ClassifiedDocument, UiMode } from './types';
import { airGappedLedger } from './ledger/dlt';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('walkthrough');
  const [uiMode, setUiMode] = useState<UiMode>(() => {
    const saved = localStorage.getItem('sih26237_ui_mode');
    return saved === 'guided' ? 'guided' : 'workstation';
  });
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [documents, setDocuments] = useState<ClassifiedDocument[]>(SAMPLE_DOCUMENTS);
  const [activePackage, setActivePackage] = useState<EncryptedPackage | null>(null);
  const [leakedText, setLeakedText] = useState<string>('');
  const [leakedMeta, setLeakedMeta] = useState<{ title: string; recipientName: string } | null>(null);
  const [blocksCount, setBlocksCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleToggleUiMode = (mode: UiMode) => {
    setUiMode(mode);
    localStorage.setItem('sih26237_ui_mode', mode);
  };

  const handleAddDocument = (newDoc: ClassifiedDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] flex flex-col items-center justify-center text-[#e6edf3] font-mono space-y-4">
        <div className="w-8 h-8 border-2 border-white/[0.12] border-t-[#adbac7] rounded-full animate-spin"></div>
        <div className="text-xs font-semibold tracking-wider text-[#adbac7] uppercase">
          INITIALIZING POST-QUANTUM CRYPTOGRAPHIC ENCLAVE...
        </div>
        <p className="text-[11px] text-[#57606a]">
          Loading NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) Keystores
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#adbac7] flex flex-col selection:bg-white/[0.15] selection:text-white">
      {/* Top Air-Gapped Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        blocksCount={blocksCount}
        uiMode={uiMode}
        onToggleUiMode={handleToggleUiMode}
      />

      {/* Main Tab Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'walkthrough' && (
          <WalkthroughTab
            documents={documents}
            recipients={recipients}
            onFinishDemo={() => setActiveTab('sender')}
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
            }}
            onNavigateToRecipient={() => setActiveTab('recipient')}
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
            onSimulateLeak={handleSimulateLeak}
            onNavigateToForensics={() => setActiveTab('forensics')}
            onNavigateToLedger={() => setActiveTab('ledger')}
            uiMode={uiMode}
          />
        )}

        {activeTab === 'forensics' && (
          <ForensicStudio
            initialLeakedText={leakedText}
            leakedMetadata={leakedMeta}
            onNavigateToLedger={() => setActiveTab('ledger')}
            uiMode={uiMode}
          />
        )}

        {activeTab === 'ledger' && (
          <DltExplorer onRefreshNeeded={refreshBlocksCount} uiMode={uiMode} />
        )}

        {activeTab === 'pqc' && <PqcRegistry recipients={recipients} uiMode={uiMode} />}

        {activeTab === 'security' && <SecurityTestHarness recipients={recipients} uiMode={uiMode} />}
      </main>

      {/* Tactical Console Footer */}
      <footer className="border-t border-white/[0.06] bg-[#090a0d] py-3.5 px-6 text-xs font-mono text-[#57606a]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <span className="text-[#768390]">
            Smart India Hackathon (SIH) &bull; Defense Provenance & Forensic Attribution Enclave
          </span>
          <span className="text-[#57606a]">
            NIST FIPS 203 (ML-KEM-768) &bull; NIST FIPS 204 (ML-DSA-65) &bull; Air-Gapped DLT Quorum
          </span>
        </div>
      </footer>
    </div>
  );
}
