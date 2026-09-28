# Post-Quantum Cryptographic Attribution and Immutable Decryption Provenance

> **Cryptographic defense system binding document decryption to recipient identity via NIST post-quantum cryptography, invisible steganographic watermarking, and air-gapped distributed ledger provenance.**

---

## 1. Project Title
**SIH26237: Post-Quantum Cryptographic Attribution and Immutable Decryption Provenance System**

## 2. One-Line Project Description
A broadcast-encryption distribution system that dynamically injects an invisible session watermark and enforces a client-side digital signature before document release, guaranteeing mathematical leak attribution on an offline distributed ledger.

## 3. Overview
In high-security and defense environments, classified digital documents are frequently broadcast to multiple cleared recipients. Under legacy systems, if an authorized recipient exfiltrates or leaks a decrypted document, traditional access logs fail: because multiple operators were granted download access, attributing the leak with mathematical certainty is impossible without individual document differentiation.

This system solves the multi-recipient attribution challenge through a **"Broadcast-Encrypt, Individually-Decrypt"** model. The sender seals a classified document once using symmetric AES-256-GCM and wraps the symmetric Content Encryption Key (CEK) independently for each recipient using NIST FIPS 203 (ML-KEM-768). Upon client-side decapsulation, the recipient's secure workstation dynamically injects an imperceptible, session-unique steganographic watermark into the plaintext and mandates a digital signature under NIST FIPS 204 (ML-DSA-65). The decrypted plaintext is released only after the signed Decryption Event is anchored into an air-gapped distributed ledger. If the document is later leaked, the forensic engine extracts the hidden watermark and maps it to the ledger transaction to identify the exact leaker with non-repudiable legal proof.

---

## 4. SIH Problem Being Addressed
* **Problem Code:** SIH26237
* **Challenge:** Preventing unauthorized document distribution, addressing the quantum threat to classical public-key infrastructure (RSA/ECC), eliminating multi-party access ambiguity, and establishing verifiable non-repudiation when classified documents are exfiltrated.
* **Core Vulnerability Solved:** When $N$ cleared operators have legitimate read clearance for the same file, passive access logs only show that all $N$ downloaded it. When an anonymous copy appears in the public domain, conventional digital forensics cannot establish which specific recipient leaked it.

---

## 5. Core Innovation
1. **Separation of Encryption and Attribution:** The sender broadcasts a single encrypted container. Individual attribution is not performed by encrypting $N$ separate files at the server; it is created **dynamically at the recipient's endpoint at the instant of decryption**.
2. **Zero Plaintext Release Without Cryptographic Commitment:** The client workstation enclaves the plaintext in volatile memory, injects the steganographic payload, signs the provenance record with the recipient's private key, and submits the transaction to the ledger before releasing the text to the viewer.
3. **Quantum-Safe Foundations:** Strict implementation of finalized NIST standards—**ML-KEM-768 (FIPS 203)** for key encapsulation and **ML-DSA-65 (FIPS 204)** for lattice-based digital signatures. Classical RSA, Diffie-Hellman, and ECDSA are completely excluded.
4. **Visual Invariance with Mathematical Distinguishability:** The rendered document maintains identical visual appearance (SSIM index $\ge 0.9998$, PSNR $\ge 49\text{ dB}$), yet contains a structured, recoverable binary payload encoded into whitespace entropy.

---

## 6. Key Features
* **NIST FIPS 203 (ML-KEM-768) Key Encapsulation:** Post-quantum lattice-based key encapsulation for multi-recipient envelopes.
* **NIST FIPS 204 (ML-DSA-65) Provenance Signatures:** EUF-CMA secure digital signatures binding recipient credentials to decryption events.
* **AES-256-GCM Symmetric Content Sealing:** Authenticated symmetric encryption with 96-bit random IVs and 128-bit authentication tags.
* **Dynamic Decryption-Time Steganography:** Dual-channel invisible steganographic encoding with synchronization headers and CRC-16 error-detection checksums.
* **Air-Gapped Distributed Ledger (DLT):** Permissioned offline blockchain utilizing SHA-256 block hash chaining and binary Merkle tree proofs.
* **3/3 Multi-Node Validator Quorum:** Simulated Byzantine fault tolerance requiring multi-validator signatures on every block.
* **Blind Forensic Extraction:** Zero-knowledge forensic analysis tool capable of identifying leakers from raw unformatted text without requiring the original document.
* **Interactive Anti-Tamper Bench:** Built-in simulation of rogue administrator attacks, demonstrating cryptographic detection of historical block rewrites.
* **Automated Adversarial Attack Lab:** 7 automated negative test vectors verifying security guarantees against tampering, forgery, and key mismatch.
* **Air-Gapped Client Storage:** IndexedDB-backed local persistence layer allowing the system to operate completely offline.

---

## 7. How the System Works

```
                                  [CLASSIFIED DOCUMENT]
                                            │
                                            ▼
                          ┌───────────────────────────────────┐
                          │   SENDER STUDIO (Packaging)       │
                          │   • AES-256-GCM symmetric seal   │
                          │   • ML-KEM-768 per recipient      │
                          └─────────────────┬─────────────────┘
                                            │
                                            ▼
                                [DISTRIBUTION CONTAINER]
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
          [RECIPIENT A (ALICE)]                       [RECIPIENT B (BOB)]
          • Decapsulate CEK (ML-KEM)                  • Decapsulate CEK (ML-KEM)
          • Inject Watermark A (Session A)            • Inject Watermark B (Session B)
          • Sign Event A with ML-DSA-65               • Sign Event B with ML-DSA-65
          • Commit to Ledger                          • Commit to Ledger
          • Release Document A                        • Release Document B
                      │                                           │
                      │ (Visually Identical: SSIM 0.9998)         │ (Leaked Online)
                      ▼                                           ▼
               [SAFE ARCHIVE]                            [PUBLIC BREACH]
                                                                  │
                                                                  ▼
                                                      ┌───────────────────────┐
                                                      │ FORENSIC STUDIO       │
                                                      │ • Extract Watermark B │
                                                      │ • Match DLT Block     │
                                                      │ • Verify ML-DSA Sig   │
                                                      │ • Identify Perpetrator│
                                                      └───────────────────────┘
```

---

## 8. End-to-End Workflow

1. **Document Ingestion:** The sender uploads or selects a classified document in the Sender Studio, reviews classification metadata, and selects cleared recipients.
2. **Broadcast Packaging:** A fresh 256-bit random Content Encryption Key (CEK) encrypts the document under AES-256-GCM. For each authorized recipient, the CEK is wrapped using their registered ML-KEM-768 public key via HKDF-SHA256.
3. **Recipient Decapsulation:** An authorized recipient accesses the Recipient Portal. The workstation identifies their matching envelope, decapsulates the shared secret using their local ML-KEM-768 secret key, and decrypts the CEK.
4. **Watermarking & Signing Gate:** A 32-byte binary payload containing a 16-bit sync word, session UUID, recipient fingerprint, and CRC-16 checksum is embedded into the document. The recipient's local ML-DSA-65 private key signs an RFC 8785 canonical JSON Decryption Event.
5. **Ledger Consensus:** The signed transaction is committed to the air-gapped ledger, validated by a 3/3 validator quorum, and minted into a block.
6. **Plaintext Presentation:** The recipient receives access to their decrypted copy inside the secure document viewport.
7. **Forensic Attribution:** If a copy is leaked, an investigator pastes the leaked text into Forensic Studio. The engine executes blind extraction, locates the matching watermark commitment on the ledger, verifies the recipient's ML-DSA-65 signature, and issues a formal Forensic Attribution Certificate.

---

## 9. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER (React 19)                 │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│  │ Mission Demo  │ │ Sender Studio │ │Recipient Portal│ │ Forensic Lab│ │
│  ├───────────────┤ ├───────────────┤ ├───────────────┤ ├─────────────┤ │
│  │ DLT Explorer  │ │ PQC Registry  │ │  Attack Lab   │ │ Workstation │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    DISTRIBUTION ORCHESTRATION SERVICE                  │
│       DistributionService.ts • End-to-End Mission Workflow Pipeline    │
└───────────────┬───────────────────┬───────────────────┬────────────────┘
                │                   │                   │
┌───────────────▼────────┐ ┌────────▼─────────┐ ┌───────▼────────────────┐
│  CRYPTOGRAPHY MODULE   │ │ WATERMARK ENGINE │ │   IMMUTABLE DLT LAYER  │
│  • ML-KEM-768 (Noble)  │ │ • Zero-Width Enc │ │ • SHA-256 Hash Chaining│
│  • ML-DSA-65 (Noble)   │ │ • CRC-16 ECC     │ │ • Binary Merkle Trees  │
│  • AES-256-GCM         │ │ • Invariance Est │ │ • 3/3 Validator Quorum │
│  • HKDF-SHA256         │ │ • Blind Recovery │ │ • Anti-Tamper Auditor  │
└───────────────┬────────┘ └────────┬─────────┘ └───────┬────────────────┘
                │                   │                   │
┌───────────────▼───────────────────▼───────────────────▼────────────────┐
│                 AIR-GAPPED STORAGE & PERSISTENCE ADAPTER               │
│                 IndexedDB (sih26237_airgap_store_v1)                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Major Components and Modules

| Module | Source Location | Primary Responsibility |
| :--- | :--- | :--- |
| **PQC Core** | `src/crypto/pqc.ts` | NIST FIPS 203 (ML-KEM-768) encapsulation/decapsulation, NIST FIPS 204 (ML-DSA-65) signing/verification, AES-256-GCM symmetric encryption, HKDF key derivation, RFC 8785 canonical serialization. |
| **Watermark Engine** | `src/watermark/engine.ts` | Dual-channel steganographic encoding/decoding, binary payload packing, CRC-16 checksum calculation, SSIM/PSNR estimation, blind text extraction. |
| **Distributed Ledger** | `src/ledger/dlt.ts` | Multi-node permissioned ledger state machine, binary Merkle tree generation, block hash verification, validator signatures, anti-tamper auditing. |
| **Distribution Service** | `src/services/distributionService.ts` | High-level orchestrator connecting packaging, client decapsulation, provenance signing, and forensic investigations. |
| **Air-Gapped Storage** | `src/storage/airGappedStorage.ts` | Offline browser persistence adapter managing IndexedDB object stores (`blocks`, `recipients`, `packages`, `keystores`, `audit_logs`). |
| **Sample Data Store** | `src/data/sampleData.ts` | Pre-configured classified defense documents and mock recipient credentials initialized on first run. |
| **Workstation UI** | `src/components/*` | Institutional defense-grade interface components built using disciplined workstation primitives. |

---

## 11. Cryptographic Architecture

### A. Document Encryption (Symmetric Content Layer)
* **Algorithm:** AES-256-GCM (`AES-GCM` via Web Cryptography API).
* **Key Size:** 256 bits (32 bytes), generated per package via `crypto.getRandomValues`.
* **Initialization Vector (IV):** 96-bit (12-byte) cryptographically secure random nonce.
* **Authentication Tag:** 128-bit (16-byte) Galois authentication tag verifying ciphertext integrity.
* **Additional Authenticated Data (AAD):** Bound to authenticated header strings preventing context-repurposing attacks.

### B. Key Derivation & Protection
* **Key Encapsulation:** NIST FIPS 203 (ML-KEM-768).
* **Key Derivation Function:** HKDF-SHA256 (Extract-and-Expand) mapping the ML-KEM shared secret to an ephemeral 256-bit Key Encryption Key (KEK).
* **Key Wrapping:** The 256-bit symmetric CEK is wrapped using the derived KEK under AES-256-GCM with a dedicated 96-bit IV.

### C. Recipient Provenance Signatures
* **Algorithm:** NIST FIPS 204 (ML-DSA-65).
* **Security Level:** NIST Security Category 3 (Lattice-based, equivalent to AES-192 against quantum attacks).
* **Message Format:** RFC 8785 Canonical JSON Serialization (JCS) ensuring deterministic key-value ordering prior to signing.
* **Public Key Fingerprint:** Truncated 64-bit hexadecimal SHA-256 digest of concatenated public keys.

---

## 12. Post-Quantum Cryptography

The application implements finalized standards released by the National Institute of Standards and Technology (NIST) in August 2024:

1. **NIST FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM-768):**
   * *Public Key Size:* 1,184 bytes
   * *Secret Key Size:* 2,400 bytes
   * *Ciphertext Size:* 1,088 bytes
   * *Shared Secret Size:* 32 bytes (256 bits)
2. **NIST FIPS 204 — Module-Lattice-Based Digital Signature Algorithm (ML-DSA-65):**
   * *Public Key Size:* 1,952 bytes
   * *Secret Key Size:* 4,032 bytes
   * *Signature Size:* 3,309 bytes

Implementation is powered by `@noble/post-quantum`, a zero-dependency, audited TypeScript library designed for high-assurance cryptographic applications.

---

## 13. Multi-Recipient Encryption

```
SENDER 
  │
  ├─► Generates random 256-bit CEK
  ├─► Encrypts Document once: AES-256-GCM(CEK, Plaintext) ──► [Ciphertext Payload]
  │
  ├─► Recipient 1 (Alice):
  │     ML-KEM-768.Encaps(PK_Alice) ──► SharedSecret_1 ──► Wrap(CEK) ──► [Envelope 1]
  │
  ├─► Recipient 2 (Bob):
  │     ML-KEM-768.Encaps(PK_Bob)   ──► SharedSecret_2 ──► Wrap(CEK) ──► [Envelope 2]
  │
  └─► Recipient 3 (Charlie):
        ML-KEM-768.Encaps(PK_Charlie) ──► SharedSecret_3 ──► Wrap(CEK) ──► [Envelope 3]
  │
  ▼
[CRYPTOGRAPHIC PACKAGE (.sihpkg)]
  ├── Ciphertext + IV + Tag
  └── [Envelope 1, Envelope 2, Envelope 3]
```

Every recipient receives the exact same ciphertext payload. When Recipient $i$ decrypts, they only process Envelope $i$, decapsulating their shared secret without access to the private keys or key material of other recipients.

---

## 14. Decryption-Time Forensic Watermarking

### Binary Payload Structure (32 Bytes / 256 Bits)
```
Offset (Bytes)   Length (Bytes)   Field Name               Description
0                2                syncHeader               0xA55A (Synchronization header)
2                16               sessionId                128-bit UUID (Unique to decryption event)
18               8                recipientFingerprint     64-bit truncated SHA-256 fingerprint
26               4                timestamp                Unix epoch in seconds (uint32)
30               2                eccChecksum              CRC-16/CCITT checksum over bytes 0..29
```

### Embedding Mechanism (Text Layer)
The 256-bit payload is converted to zero-width Unicode characters:
* Binary `0` $\rightarrow$ `\u200B` (Zero-Width Space)
* Binary `1` $\rightarrow$ `\u200C` (Zero-Width Non-Joiner)
* Byte Separator $\rightarrow$ `\uFEFF` (Zero-Width No-Break Space)
* Envelope Framing $\rightarrow$ `\u200D` (Zero-Width Joiner)

The sequence is embedded after the first natural punctuation or line-break character. It remains completely invisible to human readers and standard text renderers while surviving plain file transfers.

### Invariance Telemetry
* **SSIM (Structural Similarity Index):** Estimated at $\ge 0.9998$ (indicates zero layout distortion).
* **PSNR (Peak Signal-to-Noise Ratio):** Estimated at $> 49\text{ dB}$ (well above human visual threshold).

---

## 15. Digital Signature and Provenance

Before plaintext is rendered, the workstation constructs an RFC 8785 canonical JSON transaction:

```json
{
  "documentHashSha256": "4a7d...39b1",
  "documentId": "DOC-STRAT-OPS-001",
  "eventId": "EVT-ALICE-1790611250000",
  "packageHashSha256": "8f2c...41e0",
  "recipientId": "USR-ALICE-VANCE-01",
  "recipientPubkeyFingerprint": "9f2a4c18d7b301e4",
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef0123456789",
  "timestampEpochMs": 1790611250000,
  "watermarkCommitment": "e3b0...8555",
  "watermarkId": "WM-a1b2c3d4"
}
```

The recipient's ML-DSA-65 private key signs this canonical string. The resulting 3,309-byte post-quantum signature is attached to the transaction and committed to the DLT mempool.

---

## 16. Immutable Distributed Ledger Layer

* **Ledger Type:** Air-Gapped Permissioned Distributed Ledger (Proof-of-Authority / BFT Quorum).
* **Block Header:**
  * `height`: Monotonically increasing block index.
  * `previousHash`: SHA-256 hash of the preceding block.
  * `merkleRoot`: Binary Merkle DAG root computed from canonical transaction hashes.
  * `blockHash`: $\text{SHA-256}(\text{height} \parallel \text{timestamp} \parallel \text{previousHash} \parallel \text{merkleRoot})$.
  * `validatorSignatures`: Array of digital signatures from authorized validator nodes.
* **Validator Quorum:** 3 independent air-gapped nodes (Alpha, Bravo, Gamma). Blocks require a $3/3$ quorum signature for finality.
* **Tamper Auditor:** Recomputes all block hash pointers and Merkle roots across the entire chain to detect retroactive modifications.

---

## 17. Forensic Attribution Workflow

```
[Leaked Unmarked Text]
         │
         ▼
[1. Blind Watermark Scanner]
  Locates 0xA55A sync marker, deserializes 32-byte payload, verifies CRC-16 checksum
         │
         ▼
[2. Ledger Anchor Lookup]
  Queries DLT blocks for matching watermarkId and sessionId
         │
         ▼
[3. Cryptographic Signature Verification]
  Retrieves recipient's public key from registry; verifies ML-DSA-65 signature on transaction
         │
         ▼
[4. Merkle Inclusion Proof]
  Reconstructs binary Merkle branch to verify transaction presence in ratified block
         │
         ▼
[5. Formal Attribution Determination]
  Outputs Certificate: "Confirmed Leak Source: Col. Bob Martinez (Confidence: 100%)"
```

---

## 18. Threat Model and Security Controls

| Threat Scenario | Attack Description | Implemented Countermeasure |
| :--- | :--- | :--- |
| **Unauthorized Decryption** | Operator without envelope attempts to decrypt package. | Package contains no ML-KEM ciphertext for attacker; symmetric CEK cannot be unwrapped. |
| **Envelope Cross-Mismatch** | Bob uses Alice's KEM ciphertext with his own private key. | ML-KEM decapsulation fails or outputs pseudo-random noise, causing AES-GCM authentication failure. |
| **Ciphertext Bit-Flipping** | Adversary tampers with 1 byte of encrypted document payload. | AES-256-GCM 128-bit authentication tag verification fails, rejecting payload before release. |
| **Signature Forgery** | Attacker fabricates decryption event claiming to be Alice. | NIST FIPS 204 EUF-CMA security ensures DLT mempool rejects events with invalid ML-DSA-65 signatures. |
| **Retroactive DLT Rewrite** | Rogue administrator modifies historical recipient in Block #1. | Block hash chain breaks and Merkle root recalculation fails during automated audit. |
| **False-Positive Attribution** | Investigator inputs unwatermarked document into Forensic Lab. | Extraction fails gracefully (`FAILED_EXTRACTION`); engine refuses to attribute without valid proof. |
| **Carrier Bit-Tampering** | Leaker modifies whitespace characters in text document. | CRC-16 error detection detects corrupted headers, marking payload as `TAMPERED_WATERMARK`. |

---

## 19. Attack and Negative Security Tests

The application includes an **Automated Adversarial Security Test Bench** (`src/components/SecurityTestHarness.tsx`) executing 7 live test vectors:

* **SEC-01 (Unauthorized Decryption):** Verifies key rejection when an unauthorized party (Diana Ross) attempts decryption without an envelope.
* **SEC-02 (Cross-Envelope Mismatch):** Proves Bob's secret key cannot decapsulate Alice's ML-KEM envelope.
* **SEC-03 (Ciphertext Bit-Flip):** Injects a bit-flip at byte offset 10 and confirms AES-GCM authentication tag rejection.
* **SEC-04 (Signature Forgery):** Submits an invalid 3,309-byte signature to the DLT mempool and confirms immediate rejection.
* **SEC-05 (Historical Ledger Audit):** Recomputes Merkle DAGs and SHA-256 block hash links across all committed blocks.
* **SEC-06 (False-Positive Check):** Submits raw text without steganography to verify the engine refuses false attribution.
* **SEC-07 (Carrier Tamper Resilience):** Verifies forensic recovery behavior on modified text carriers.

---

## 20. Offline and Air-Gapped Deployment

* **Runtime Autonomy:** The core application executes 100% client-side inside the browser sandbox. Cryptography (Web Crypto + `@noble/post-quantum` compiled to JS) requires **zero external network requests**.
* **Zero External Dependencies at Runtime:** No connections to remote blockchain networks, external cloud services, or CDN-hosted scripts are made during decryption, signing, or forensic analysis.
* **Local State Persistence:** All blocks, keys, and packages are persisted locally using the browser's IndexedDB engine (`sih26237_airgap_store_v1`).
* **Development vs. Runtime:** Network access is required solely during initial `npm install` to download dependencies from npm. Once built via `npm run build`, the production bundle can be served from an isolated local server.

---

## 21. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.0.1` | Core UI component lifecycle and state management |
| **Build Tooling** | Vite | `^8.3.0` | Fast development server and ES module bundler |
| **Type System** | TypeScript | `^7.0.2` | Static type checking and interface contracts |
| **Styling** | Tailwind CSS | `^4.3.3` | Utility-first styling engine with `@tailwindcss/vite` |
| **Post-Quantum Crypto** | `@noble/post-quantum` | `^0.7.1` | Audited implementations of ML-KEM-768 and ML-DSA-65 |
| **Symmetric & Hashing** | Web Cryptography API | Native | Hardware-accelerated AES-256-GCM, SHA-256, HKDF, PBKDF2 |
| **Local Storage** | IndexedDB API | Native | Isolated persistent offline storage for blocks and keystores |
| **Icons** | Lucide React | `^0.546.0` | Tactical workstation iconography |
| **Micro-Interactions** | Canvas Confetti | `^1.9.4` | Visual celebration upon successful forensic case resolution |
| **Server Runtime** | Express / Node.js | `^4.21.2` / `^22.x` | Production static asset server |

---

## 22. Project Structure

```
.
├── .env.example                     # Environment configuration reference
├── index.html                       # HTML5 entry point
├── package.json                     # Project manifest and npm dependencies
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite configuration with Tailwind CSS v4
├── src/
│   ├── App.tsx                      # Root component and navigation state
│   ├── main.tsx                     # React DOM entry point
│   ├── index.css                    # Global design tokens and Tailwind imports
│   ├── components/                  # Workstation UI screens and primitives
│   │   ├── WalkthroughTab.tsx       # 5-Stage Mission Execution Demonstration
│   │   ├── SenderStudio.tsx         # Document preparation & packaging console
│   │   ├── RecipientPortal.tsx      # Recipient decapsulation & provenance terminal
│   │   ├── ForensicStudio.tsx       # Forensic extraction & attribution studio
│   │   ├── DltExplorer.tsx          # Air-gapped ledger inspection & tamper bench
│   │   ├── PqcRegistry.tsx          # NIST FIPS 203/204 key registry & generator
│   │   ├── SecurityTestHarness.tsx  # 7-vector negative adversarial test lab
│   │   ├── Navbar.tsx               # Workstation navigation bar
│   │   └── ui/
│   │       └── WorkstationPrimitives.tsx  # Reusable defense-grade UI primitives
│   ├── crypto/
│   │   └── pqc.ts                   # ML-KEM, ML-DSA, AES-GCM, HKDF, RFC 8785 JCS
│   ├── data/
│   │   └── sampleData.ts            # Default classified documents and initial keys
│   ├── ledger/
│   │   └── dlt.ts                   # Permissioned DLT, Merkle DAGs, consensus engine
│   ├── services/
│   │   └── distributionService.ts   # End-to-end mission workflow orchestration
│   ├── storage/
│   │   └── airGappedStorage.ts      # IndexedDB offline persistence adapter
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions and interfaces
│   └── watermark/
│       └── engine.ts                # Steganography embedding, extraction, CRC-16
```

---

## 23. Installation and Setup

### Prerequisites
* **Node.js:** Version `18.0.0` or higher (Node `20.x` or `22.x` recommended).
* **NPM:** Version `9.x` or higher.
* **Modern Web Browser:** Chrome, Edge, Firefox, or Safari with Web Cryptography API support.

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

---

## 24. Environment Configuration

| Variable | Required | Purpose | Default / Example |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | Reserved for optional AI analysis capabilities | `"MY_GEMINI_API_KEY"` |
| `APP_URL` | Optional | Application hosting base URL | `"http://localhost:3000"` |

*Note: The core cryptographic operations, DLT engine, steganographic watermarking, and forensic attribution do not require any API keys to function.*

---

## 25. Running the Application

### Development Server
Starts the local development server on port 3000:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Type Checking & Linting
Runs the TypeScript compiler to verify all types without emitting files:
```bash
npm run lint
```

### Production Build
Compiles TypeScript and creates an optimized production bundle:
```bash
npm run build
```

### Preview Production Build
Locally previews the production build output:
```bash
npm run preview
```

---

## 26. Using the System

1. **Mission Demo:** Click **"Run Full Lifecycle Simulation"** to watch the automated 5-stage pipeline execute from broadcast encryption to legal attribution.
2. **Sender Studio:** Select a classified document dossier, select authorized recipients, and click **"Generate Encrypted Distribution Package"**. You can export the container as a `.sihpkg` file.
3. **Recipient Portal:** Switch operator credentials (e.g., Dr. Alice Vance vs. Col. Bob Martinez). Notice how unauthorized personas are rejected by the Access Gate. Click **"Decrypt & Bind Provenance Event"** to decapsulate the document and sign the provenance record.
4. **Inspect Forensic Channel:** While viewing the decrypted document, click **"Inspect Stego Channel"** to view the invisible diagnostic parameters (Session UUID, Watermark Commitment).
5. **Simulate Leak:** Click **"Simulate Leak of Bob's Copy"** to hand off Bob's watermarked text directly into the Forensic Studio.
6. **Forensic Studio:** Click **"Execute Blind Forensic Attribution"** to extract the watermark, query the ledger, and resolve the leaker with mathematical proof.
7. **DLT Explorer:** Inspect committed blocks, view Merkle roots, or click **"Simulate Rogue Admin Tamper"** to witness real-time hash-chain integrity failure detection.
8. **Attack Lab:** Click **"Run All 7 Security Tests"** to verify negative threat defenses.

---

## 27. Demonstration Scenario (Judge Walkthrough Guide)

For SIH evaluators and judges, follow this step-by-step evaluation procedure:

| Step | Action | Expected Observation |
| :--- | :--- | :--- |
| **1. Broadcast Encrypt** | Navigate to **Sender Studio**, pick "Operation Cobalt Shield", select Alice and Bob, click **Generate Encrypted Package**. | Container is sealed once under AES-256-GCM; two distinct ML-KEM-768 envelopes are provisioned. |
| **2. Alice Decrypts** | Open **Recipient Portal**, select Alice, click **Decrypt & Bind Provenance Event**. | Pipeline executes steps 1–6. Block #2 is minted to the ledger. Alice receives her copy. |
| **3. Bob Decrypts** | Switch operator to Bob, click **Decrypt & Bind Provenance Event**. | Block #3 is minted with Bob's distinct ML-DSA-65 signature and a unique session watermark. |
| **4. Invariance Verification** | Compare Alice's and Bob's copies side-by-side in Mission Demo. | SSIM index displays `0.9998`. Documents appear visually identical to human readers. |
| **5. Exfiltration Simulation** | In Recipient Portal under Bob's terminal, click **Simulate Leak of Bob's Copy**. | Workstation transitions to Forensic Studio with Bob's text pre-loaded. |
| **6. Blind Attribution** | Click **Execute Blind Forensic Attribution**. | Engine extracts watermark `WM-...`, locates Block #3 on the ledger, verifies Bob's ML-DSA-65 signature, and attributes the leak to **Col. Bob Martinez (Confidence: 100%)**. |
| **7. Tamper Verification** | Go to **DLT Explorer** and click **Simulate Rogue Admin Tamper**. | Block #1 hash link breaks; auditor immediately raises **CRITICAL ALERT: ROGUE RECORD TAMPERING DETECTED**. |

---

## 28. Testing

### Implemented Validation Suites
1. **Automated Adversarial Security Suite (`src/components/SecurityTestHarness.tsx`):**
   * Empirical verification of 7 negative threat vectors executed against real cryptographic routines.
2. **Static Type Checking (`npm run lint`):**
   * Full TypeScript compiler verification (`tsc --noEmit`) ensuring strict type compliance across all components.
3. **Production Build Validation (`npm run build`):**
   * Production asset bundling via Vite to verify zero dead imports or missing runtime references.

---

## 29. Security Considerations

* **Key Storage in Prototype:** Private keys in this demonstration prototype are retained in client memory (or encrypted under PBKDF2/AES-GCM in IndexedDB). In an operational defense deployment, private keys should be bound to hardware security modules (HSMs) or TPM 2.0 chips via PKCS#11 or FIDO2/WebAuthn.
* **Text Formatting Normalization:** The current zero-width text steganography survives plain copy-paste operations into text editors and standard word processors. However, copying through aggressively sanitizing web scrapers or OCR reconstruction may strip zero-width characters.
* **Side-Channel Protections:** The `@noble/post-quantum` library implements constant-time operations where feasible, but browser JavaScript execution environments may be subject to timing variations under extreme adversarial conditions.

---

## 30. Limitations and Known Constraints

* **Document Format Support:** Currently optimized for plain text (`.txt`) and Markdown (`.md`) formats. Binary formats (PDF, DOCX) are represented conceptually via text carrier extraction.
* **Watermark Survivability Under Format Alteration:** Text watermarking relies on whitespace entropy; converting text to printed physical paper and re-scanning via OCR will remove zero-width Unicode characters unless paired with visual glyph-modulation print watermarking.
* **Simulated Hardware Enclaves:** Recipient hardware keystores and validator nodes are simulated locally within the browser sandbox rather than executing on physically isolated hardware appliances.
* **In-Browser Blockchain Scale:** The DLT ledger is engineered as an in-browser proof-of-authority chain suitable for demonstration and local auditing; it does not implement full P2P gossip networking between physical servers.

---

## 31. Future Improvements
* **PDF Glyph-Shift Steganography:** Integrate font micro-metrics modulation and discrete cosine transform (DCT) frequency manipulation for rendered PDF documents.
* **Hardware HSM Integration:** Bind ML-DSA-65 private keys directly to physical YubiKeys or TPM 2.0 modules via WebAuthn Extensions.
* **Distributed Network Gossip:** Connect standalone desktop workstations via an offline libp2p gossip mesh across an isolated local area network (LAN).
* **Cross-Language Verification CLI:** Provide a standalone Rust/Go CLI tool for external auditors to verify `.sihpkg` files and DLT blocks independently of the web browser.

---

## 32. Screens / UI Overview

| Screen | Description |
| :--- | :--- |
| **Mission Demo (`WalkthroughTab.tsx`)** | End-to-end interactive 5-stage demonstration guiding evaluators from broadcast encryption to legal leak resolution. |
| **Sender Studio (`SenderStudio.tsx`)** | Classified document dossier, recipient selection register, and AES-256-GCM + ML-KEM-768 packaging console. |
| **Recipient Portal (`RecipientPortal.tsx`)** | Recipient identity register, access control gate, live 6-stage decryption pipeline, and secure document viewport. |
| **Forensic Studio (`ForensicStudio.tsx`)** | Blind watermark recovery engine, ledger search, ML-DSA-65 signature validator, and formal Certificate emitter. |
| **DLT Explorer (`DltExplorer.tsx`)** | Air-gapped ledger inspection console showing 3/3 validator quorum, committed blocks, and anti-tamper auditor. |
| **PQC Registry (`PqcRegistry.tsx`)** | Directory of registered recipient ML-KEM-768 and ML-DSA-65 public keys with live WebAssembly keypair generator. |
| **Attack Lab (`SecurityTestHarness.tsx`)** | Automated negative test bench evaluating 7 adversarial vectors with expandable execution logs. |

---

## 33. SIH Requirement Traceability

| SIH Requirement | Implementation Details | Code Location | Status |
| :--- | :--- | :--- | :--- |
| **Post-Quantum Cryptography** | Finalized NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65). | `src/crypto/pqc.ts` | **Implemented** |
| **Multi-Recipient Broadcast Encrypt** | Single AES-256-GCM payload with individual ML-KEM wrapped envelopes. | `src/services/distributionService.ts` | **Implemented** |
| **Decryption-Time Attribution** | Dynamic steganographic binding at decapsulation before plaintext release. | `src/watermark/engine.ts` | **Implemented** |
| **Cryptographic Provenance** | ML-DSA-65 signed RFC 8785 canonical Decryption Events. | `src/services/distributionService.ts` | **Implemented** |
| **Immutable Ledger Layer** | Offline permissioned DLT with SHA-256 hash chaining and binary Merkle trees. | `src/ledger/dlt.ts` | **Implemented** |
| **Blind Forensic Recovery** | Watermark extraction without requiring the original reference document. | `src/watermark/engine.ts` | **Implemented** |
| **Tamper Detection & Auditing** | Anti-tamper engine with interactive rogue administrator simulation. | `src/ledger/dlt.ts` | **Implemented** |
| **Offline Air-Gap Readiness** | Zero external runtime calls; IndexedDB local storage engine. | `src/storage/airGappedStorage.ts` | **Implemented** |
| **Adversarial Verification Suite** | 7 automated negative test cases executing against live crypto engine. | `src/components/SecurityTestHarness.tsx` | **Implemented** |
| **Physical Hardware HSM Binding** | Hardware security modules simulated in volatile client browser keystores. | `src/types/index.ts` | **Simulated** |

---

## 34. Contributing
This repository is submitted as an engineering prototype for the Smart India Hackathon (SIH). Contributions, code reviews, and audits are welcome:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/pqc-enhancement`).
3. Commit your changes with descriptive messages.
4. Ensure all TypeScript checks pass (`npm run lint` and `npm run build`).
5. Open a Pull Request.

---

## 35. License
Distributed under the **Apache-2.0 License**. See `LICENSE` for details.
