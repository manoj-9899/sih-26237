/**
 * Sample Classified Intelligence Documents and Recipient Data.
 * Pre-generates NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) key material
 * for authorized defense recipients.
 */

import { ClassifiedDocument, Recipient } from '../types';
import { generateRecipientPqcKeys, bytesToHex } from '../crypto/pqc';
import { airGappedLedger } from '../ledger/dlt';
import { airGappedStorage } from '../storage/airGappedStorage';

export const SAMPLE_DOCUMENTS: ClassifiedDocument[] = [
  {
    id: 'DOC-2026-AEGIS-991',
    title: 'OPERATION AEGIS: Strategic Anti-Air Grid Deployment Protocol',
    classification: 'TOP SECRET // SCI',
    caveats: 'NOFORN // ORCON // SPECIAL ACCESS REQUIRED',
    originatingOffice: 'Directorate of Joint Strategic Operations, Section 4',
    summary:
      'Operational deployment blueprints, radar frequency hop tables, and missile battery staging coordinates for eastern theater perimeter defense.',
    rawText: `================================================================================
TOP SECRET // SCI // NOFORN // ORCON // EYES ONLY
DOCUMENT CONTROL NUMBER: TS-SCI-2026-AEGIS-0091
ORIGINATING AUTHORITY: JOINT STRATEGIC OPERATIONS DIRECTORATE
DATE: 28 SEPTEMBER 2026

SUBJECT: STRATEGIC AIR-DEFENSE RADAR HOPPING MATRIX & THEATER DISPERSION

1. EXECUTIVE DIRECTIVE
Under National Security Command Directive 14-B, the following operational matrix
governs all quantum-hardened radar array synchronizations across Theater Sector 4.
All personnel accessing this material are bound by statutory secrecy obligations.

2. FREQUENCY HOPPING ALLOCATION TABLE (OCTOBER 2026 CYCLE)
- Array Alpha-1 (Barents Vector):  14.285 GHz -> 14.890 GHz [Pseudorandom Shift: Delta-9]
- Array Bravo-3 (Aegean Vector):   12.110 GHz -> 12.650 GHz [Pseudorandom Shift: Kappa-4]
- Array Charlie-7 (Indo-Pacific):  15.420 GHz -> 16.020 GHz [Pseudorandom Shift: Sigma-1]

3. COUNTER-MEASURE RESILIENCE DIRECTIVE
In the event of an electronic warfare jamming sweep exceeding 45 dB threshold,
ground tactical commanders shall initiate autonomous post-quantum encrypted fallback
links utilizing the tactical ML-KEM-768 key encapsulation standard.

4. SENSITIVE COMPARTMENT DISSEMINATION LIST
Authorized billets: Chief Intelligence Analyst, Senior Logistics Director, Cyber Defense Lead.
Any unauthorized reproduction, photographic capture, or leak constitutes treason under
the Espionage Act. All distribution packets are forensically tagged at point of decryption.
================================================================================`,
    visualPages: [],
    createdAt: 1790610000000,
  },
  {
    id: 'DOC-2026-QUANTUM-GRID-442',
    title: 'CRITICAL INFRASTRUCTURE: Post-Quantum Grid Transition Matrix',
    classification: 'SECRET',
    caveats: 'RELEASABLE TO JOINT STRATEGIC COMMAND',
    originatingOffice: 'Cybersecurity & Critical Infrastructure Security Agency',
    summary:
      'National power grid cryptographic migration timeline, hardware security module provisioning, and emergency failover protocols.',
    rawText: `================================================================================
SECRET // REL TO STRATCOM // INFRASTRUCTURE CRITICAL
DOCUMENT ID: CISA-PQC-GRID-2026-REV3
SECURITY CLASSIFICATION: SECRET

1. OVERVIEW
This document outlines the mandatory replacement of legacy RSA-2048 and ECDSA-P256
keys across all Regional Transmission Organizations (RTOs) with NIST FIPS 203 (ML-KEM)
and FIPS 204 (ML-DSA) compliant hardware enclaves.

2. KEY MIGRATION MILESTONES
- Substation SCADA Gateway Enclaves: 100% ML-DSA-65 firmware verification.
- Inter-Grid High Voltage Control Channels: 256-bit AES-GCM with post-quantum KEM session exchange.
- Emergency Black-Start Control Bus: Air-gapped manual key loading protocol.

3. AUDIT & FORENSIC TRACKING
Decryption events on this document require immediate non-repudiation signing by the
designated engineer's hardware key and registration on the secure facility ledger.
================================================================================`,
    visualPages: [],
    createdAt: 1790612000000,
  },
  {
    id: 'DOC-2026-MARITIME-SEC7',
    title: 'DIPLOMATIC & MARITIME PROTOCOL: Sector 7 Transit Corridors',
    classification: 'CONFIDENTIAL',
    caveats: 'AUTHORIZED BILLET ACCESS ONLY',
    originatingOffice: 'Bureau of Maritime Security & International Affairs',
    summary:
      'Coordinated civilian and naval maritime transit corridors, restricted coordinates, and international escort protocols.',
    rawText: `================================================================================
CONFIDENTIAL // RESTRICTED DISSEMINATION
BUREAU OF MARITIME SECURITY // STRATEGIC LOGISTICS
FILE: BMS-SEC7-CORRIDOR-ALPHA

1. SCOPE
Designation of deep-water acoustic safe lanes through Sector 7 international choke points.
All commercial convoys must register with designated escort vessels 72 hours prior to entry.

2. COORDINATE BOUNDARIES
- Entry Checkpoint Papa: 14°22'05" N, 112°45'18" E
- Mid-Transit Waypoint Sierra: 15°10'42" N, 114°02'30" E
- Exit Waypoint Victor: 16°05'12" N, 115°50'00" E

3. HANDLING INSTRUCTIONS
This file must be kept in encrypted local storage. Decryptions are monitored via
cryptographic session watermarking.
================================================================================`,
    visualPages: [],
    createdAt: 1790614000000,
  },
];

// In-Memory Recipients with Pre-Generated Authentic PQC Key Material
let INITIALIZED_RECIPIENTS: Recipient[] = [];
let initPromise: Promise<Recipient[]> | null = null;

export async function initializeRecipientsAndLedger(): Promise<Recipient[]> {
  if (INITIALIZED_RECIPIENTS.length > 0) {
    return INITIALIZED_RECIPIENTS;
  }
  if (!initPromise) {
    initPromise = (async () => {
      if (INITIALIZED_RECIPIENTS.length > 0) {
        return INITIALIZED_RECIPIENTS;
      }

      // Ensure genesis block is initialized (loaded from IndexedDB or created)
      await airGappedLedger.initGenesis();

      // Check persistent IndexedDB for recipients
      const savedRecipients = await airGappedStorage.getRecipients();
      if (savedRecipients && savedRecipients.length > 0) {
        INITIALIZED_RECIPIENTS = savedRecipients;
        for (const r of savedRecipients) {
          airGappedLedger.registerRecipient(r);
        }
        return savedRecipients;
      }

      const recipientProfiles = [
        {
          id: 'USR-ALICE-VANCE-01',
          name: 'Dr. Alice Vance',
          role: 'Chief Intelligence Analyst',
          organization: 'Directorate of Naval Intelligence',
          clearanceLevel: 'TOP SECRET // SCI' as const,
          avatarInitials: 'AV',
        },
        {
          id: 'USR-BOB-MARTINEZ-02',
          name: 'Col. Bob Martinez',
          role: 'Senior Logistics Director',
          organization: 'Joint Strategic Support Command',
          clearanceLevel: 'TOP SECRET // SCI' as const,
          avatarInitials: 'BM',
        },
        {
          id: 'USR-CHARLIE-CHEN-03',
          name: 'Cmdr. Charlie Chen',
          role: 'Cyber Defense Lead',
          organization: 'National Cyber Security Center',
          clearanceLevel: 'SECRET' as const,
          avatarInitials: 'CC',
        },
        {
          id: 'USR-DIANA-ROSS-04',
          name: 'Amb. Diana Ross',
          role: 'Foreign Affairs Security Liaison',
          organization: 'Diplomatic Protection Bureau',
          clearanceLevel: 'CONFIDENTIAL' as const,
          avatarInitials: 'DR',
        },
      ];

      const recipients: Recipient[] = [];

      for (const prof of recipientProfiles) {
        // Generate real NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) keypairs
        const keys = await generateRecipientPqcKeys();

        const recipient: Recipient = {
          ...prof,
          keys: {
            kemAlgorithm: 'ML-KEM-768',
            kemPublicKeyHex: bytesToHex(keys.kemPublicKey),
            kemSecretKeyHex: bytesToHex(keys.kemSecretKey),
            dsaAlgorithm: 'ML-DSA-65',
            dsaPublicKeyHex: bytesToHex(keys.dsaPublicKey),
            dsaSecretKeyHex: bytesToHex(keys.dsaSecretKey),
            keyFingerprint: keys.fingerprint,
            registeredAt: Date.now() - 3600000 * 24 * 7, // 7 days ago
          },
        };

        recipients.push(recipient);
        airGappedLedger.registerRecipient(recipient);
      }

      await airGappedStorage.saveRecipients(recipients);
      INITIALIZED_RECIPIENTS = recipients;
      return recipients;
    })();
  }

  return await initPromise;
}
