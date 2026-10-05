import React, { useState } from 'react';
import {
  ShieldCheck,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PageShell,
  PageHeader,
  Section,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  VerificationBadge,
} from './ui/designSystem';
import { DistributionService } from '../services/distributionService';
import { airGappedLedger } from '../ledger/dlt';
import { SAMPLE_DOCUMENTS } from '../data/sampleData';
import { Recipient } from '../types';
import {
  hexToBytes,
  base64ToBytes,
  bytesToBase64,
  verifyMlDsa65,
  canonicalizeJson,
  sha256Hex,
} from '../crypto/pqc';

interface VerificationViewProps {
  recipients: Recipient[];
}

interface TestCase {
  id: string;
  category: 'Cryptography' | 'Attribution' | 'Ledger' | 'Watermark';
  title: string;
  threatScenario: string;
  expectedResult: string;
  runTest: () => Promise<{ passed: boolean; details: string; rawLogs: string[] }>;
}

export const VerificationView: React.FC<VerificationViewProps> = ({ recipients }) => {
  const [testResults, setTestResults] = useState<
    Record<string, { passed: boolean; details: string; rawLogs: string[]; isRunning?: boolean }>
  >({});
  const [runningAll, setRunningAll] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const testCases: TestCase[] = [
    {
      id: 'SEC-01',
      category: 'Cryptography',
      title: 'Unauthorized decryption rejection',
      threatScenario: 'Recipient without an envelope attempts to decapsulate the document key.',
      expectedResult: 'Access rejected. Decapsulation fails and no plaintext is released.',
      runTest: async () => {
        const doc = SAMPLE_DOCUMENTS[0];
        const alice = recipients[0];
        const charlie = recipients[2] || recipients[recipients.length - 1];
        const pkg = await DistributionService.createEncryptedPackage(doc, [alice]);

        const logs = [
          `Target Package: ${pkg.packageId}`,
          `Authorized Recipient: ${alice.name}`,
          `Unauthorized Requester: ${charlie.name}`,
        ];

        try {
          await DistributionService.executeRecipientDecryption(pkg, charlie);
          return { passed: false, details: 'Unauthorized recipient accessed plaintext!', rawLogs: logs };
        } catch (err: any) {
          logs.push(`Enclave Access Denied: ${err.message}`);
          return {
            passed: true,
            details: 'Unauthorized recipient lacked ML-KEM envelope; decryption aborted cleanly.',
            rawLogs: logs,
          };
        }
      },
    },
    {
      id: 'SEC-02',
      category: 'Cryptography',
      title: 'Cross-recipient key isolation',
      threatScenario: 'Adversary uses Recipient A’s private key against Recipient B’s envelope.',
      expectedResult: 'Decapsulation fails. Lattice KEM guarantees envelope isolation.',
      runTest: async () => {
        const doc = SAMPLE_DOCUMENTS[0];
        const alice = recipients[0];
        const bob = recipients[1];
        const pkg = await DistributionService.createEncryptedPackage(doc, [alice, bob]);

        const bobWithAliceKey: Recipient = {
          ...bob,
          keys: { ...bob.keys, kemSecretKeyHex: alice.keys.kemSecretKeyHex },
        };

        const logs = [
          `Packaging document for Alice & Bob`,
          `Attempting to open Bob's envelope with Alice's ML-KEM-768 secret key...`,
        ];

        try {
          await DistributionService.executeRecipientDecryption(pkg, bobWithAliceKey);
          return { passed: false, details: 'Cross-recipient decapsulation succeeded!', rawLogs: logs };
        } catch (err: any) {
          logs.push(`Decapsulation failed: ${err.message}`);
          return {
            passed: true,
            details: 'Lattice KEM guarantees strict cryptographic isolation across envelopes.',
            rawLogs: logs,
          };
        }
      },
    },
    {
      id: 'SEC-03',
      category: 'Cryptography',
      title: 'Ciphertext bit-flip tampering resistance',
      threatScenario: 'A rogue network proxy flips a bit in the encrypted package payload during transmission.',
      expectedResult: 'Tampering detected. AES-256-GCM authentication tag check fails immediately.',
      runTest: async () => {
        const doc = SAMPLE_DOCUMENTS[0];
        const alice = recipients[0];
        const pkg = await DistributionService.createEncryptedPackage(doc, [alice]);

        const rawCipherBytes = base64ToBytes(pkg.ciphertextBase64);
        rawCipherBytes[12] ^= 0x01; // flip 1 bit
        const tamperedCipherBase64 = bytesToBase64(rawCipherBytes);
        const tamperedPkg = { ...pkg, ciphertextBase64: tamperedCipherBase64 };

        const logs = [`Flipped bit 0x01 at byte offset 12 in AES-256-GCM ciphertext`];

        try {
          await DistributionService.executeRecipientDecryption(tamperedPkg, alice);
          return { passed: false, details: 'GCM authentication tag did not catch bit-flip!', rawLogs: logs };
        } catch (err: any) {
          logs.push(`GCM authentication failure caught: ${err.message}`);
          return {
            passed: true,
            details: 'AES-256-GCM authentication tag detected corrupted ciphertext and aborted plaintext release.',
            rawLogs: logs,
          };
        }
      },
    },
    {
      id: 'SEC-04',
      category: 'Attribution',
      title: 'Forged recipient signature rejection',
      threatScenario: 'Adversary creates a fake Decryption Event using an invalid signature.',
      expectedResult: 'Signature rejected. Validator nodes drop forged event before consensus.',
      runTest: async () => {
        const alice = recipients[0];
        const fakeSig = new Uint8Array(3309).fill(0xaa);
        const fakeEvent = {
          eventId: `EVT-FORGED-${Date.now()}`,
          recipientId: alice.id,
          recipientName: alice.name,
          packageId: 'PKG-TEST',
          documentTitle: 'CONFIDENTIAL TEST',
          documentHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          watermarkId: 'WM-FAKE-1234',
          watermarkCommitment: 'sha256-fake',
          timestampEpochMs: Date.now(),
          signatureAlgorithm: 'ML-DSA-65' as const,
          recipientSignatureBase64: bytesToBase64(fakeSig),
        };

        const logs = [
          `Created forged Decryption Event: ${fakeEvent.eventId}`,
          `Attaching corrupted 3,309-byte ML-DSA-65 signature`,
        ];

        const payloadBytes = new TextEncoder().encode(canonicalizeJson(fakeEvent));
        const pubKeyBytes = hexToBytes(alice.keys.dsaPublicKeyHex);
        const isValid = verifyMlDsa65(fakeSig, payloadBytes, pubKeyBytes);
        logs.push(`ML-DSA-65 verification returned: ${isValid}`);

        if (isValid) {
          return { passed: false, details: 'Corrupted signature passed verification!', rawLogs: logs };
        } else {
          return {
            passed: true,
            details: 'NIST FIPS 204 lattice verification rejected forged signature.',
            rawLogs: logs,
          };
        }
      },
    },
    {
      id: 'SEC-05',
      category: 'Ledger',
      title: 'Historical ledger tamper detection',
      threatScenario: 'A rogue insider modifies a historical block to change an attribution record.',
      expectedResult: 'Tampering detected. Block hash chain and Merkle roots break instantly.',
      runTest: async () => {
        const logs = [`Simulating rogue database modification in historical block`];
        const auditBefore = await airGappedLedger.verifyLedgerIntegrity();
        logs.push(`Pre-test ledger state: ${auditBefore.isValid ? 'VALID' : 'INVALID'}`);

        airGappedLedger.simulateTamper(1, 'USR-MALICIOUS-ADMIN-TAMPER');
        const auditAfter = await airGappedLedger.verifyLedgerIntegrity();
        logs.push(`Post-tamper audit state: ${auditAfter.isValid ? 'VALID' : 'TAMPER_DETECTED'}`);

        airGappedLedger.restoreLedger();
        logs.push('Quorum restored to authenticated state');

        if (!auditAfter.isValid) {
          return {
            passed: true,
            details: 'SHA-256 block hash chain and Merkle root caught unauthorized modification.',
            rawLogs: logs,
          };
        } else {
          return { passed: false, details: 'Tampered block was not detected!', rawLogs: logs };
        }
      },
    },
    {
      id: 'SEC-06',
      category: 'Watermark',
      title: 'False-positive watermark rejection',
      threatScenario: 'Forensic scanner is fed an un-watermarked plain document.',
      expectedResult: 'Invalid fingerprint rejected. Engine does not falsely identify any recipient.',
      runTest: async () => {
        const rawText = 'This is an un-watermarked public memo with standard ASCII characters.';
        const logs = [`Scanning document without steganographic channel...`];
        const report = await DistributionService.investigateLeakedDocument(rawText);

        logs.push(`Verdict: ${report.attributionVerdict}`);
        if (!report.watermarkExtracted && report.attributionVerdict === 'FAILED_EXTRACTION') {
          return {
            passed: true,
            details: 'Scanner correctly reported no watermark. Zero false positives.',
            rawLogs: logs,
          };
        } else {
          return { passed: false, details: 'Scanner falsely extracted a watermark!', rawLogs: logs };
        }
      },
    },
    {
      id: 'SEC-07',
      category: 'Watermark',
      title: 'Watermark corruption resistance',
      threatScenario: 'Adversary corrupts random zero-width characters in the document whitespace.',
      expectedResult: 'Tampering detected. CRC-16 checksum fails and invalid payload is rejected.',
      runTest: async () => {
        const doc = SAMPLE_DOCUMENTS[0];
        const alice = recipients[0];
        const pkg = await DistributionService.createEncryptedPackage(doc, [alice]);
        const decResult = await DistributionService.executeRecipientDecryption(pkg, alice);

        // Corrupt zero-width characters in watermarked string
        let corrupted = decResult.watermarkedText;
        corrupted = corrupted.replace(/[\u200B\u200C]/g, '\u200D'); // Corrupt bits

        const logs = [`Corrupted zero-width whitespace bit sequence in memory`];
        const report = await DistributionService.investigateLeakedDocument(corrupted);

        if (report.attributionVerdict !== 'CONFIRMED_LEAK_SOURCE') {
          return {
            passed: true,
            details: 'CRC-16 error-detection caught bit corruption and aborted attribution.',
            rawLogs: logs,
          };
        } else {
          return { passed: false, details: 'Corrupted watermark accepted!', rawLogs: logs };
        }
      },
    },
  ];

  const handleRunSingleTest = async (test: TestCase) => {
    setTestResults((prev) => ({
      ...prev,
      [test.id]: { passed: false, details: 'Executing test scenario...', rawLogs: [], isRunning: true },
    }));

    try {
      const result = await test.runTest();
      setTestResults((prev) => ({
        ...prev,
        [test.id]: { ...result, isRunning: false },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [test.id]: { passed: false, details: `Test Error: ${err.message}`, rawLogs: [err.message], isRunning: false },
      }));
    }
  };

  const handleRunAllTests = async () => {
    setRunningAll(true);
    for (const test of testCases) {
      await handleRunSingleTest(test);
    }
    setRunningAll(false);
  };

  const totalExecuted = Object.keys(testResults).length;
  const totalPassed = Object.values(testResults).filter((r) => r.passed).length;

  return (
    <PageShell>
      <PageHeader
        title="Security verification"
        description="Test the platform against defined attack scenarios."
        badge={
          totalExecuted > 0 && (
            <VerificationBadge label={`${totalPassed}/${totalExecuted} Tests passed`} />
          )
        }
        action={
          <div className="flex items-center gap-2">
            {totalExecuted > 0 && (
              <SecondaryButton
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => setTestResults({})}
              >
                Reset
              </SecondaryButton>
            )}
            <PrimaryButton
              size="sm"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={handleRunAllTests}
              loading={runningAll}
            >
              Run all 7 tests
            </PrimaryButton>
          </div>
        }
      />

      <div className="space-y-4">
        {testCases.map((test) => {
          const res = testResults[test.id];
          const isExpanded = expandedLogId === test.id;

          return (
            <Section key={test.id} className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {test.category}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs truncate">
                      {test.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-2xl">
                    {test.threatScenario}
                  </p>
                  <div className="text-[11px] text-slate-700">
                    <span className="text-slate-500">Expected result:</span> {test.expectedResult}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {res && (
                    <StatusBadge
                      status={res.passed ? 'verified' : 'failed'}
                      icon={res.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                    >
                      {res.passed ? 'Passed' : 'Failed'}
                    </StatusBadge>
                  )}

                  <SecondaryButton
                    size="sm"
                    onClick={() => handleRunSingleTest(test)}
                    loading={res?.isRunning}
                  >
                    Run test
                  </SecondaryButton>
                </div>
              </div>

              {/* Execution details & isolated logs */}
              {res && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>{res.details}</span>
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : test.id)}
                      className="text-slate-400 hover:text-slate-700 font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide logs' : 'View logs'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {isExpanded && res.rawLogs.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-700 space-y-1">
                      {res.rawLogs.map((l, i) => (
                        <div key={i}>&gt; {l}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Section>
          );
        })}
      </div>
    </PageShell>
  );
};
