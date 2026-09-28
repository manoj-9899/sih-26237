# Dual-Mode Workstation Implementation Plan: Guided Mode vs. Workstation Mode

## Overview
We will implement a global dual-mode interface switch that empowers both first-time evaluators/beginners and experienced security operators:
1. **Workstation Mode (Clean / Pro):** An ultra-clean, high-density, professional defense terminal with low text density, status-first hierarchy, progressive disclosure for technical details, and zero educational clutter.
2. **Guided Mode (Beginner / Evaluator):** Inline collapsible guidance panels, interactive step-by-step hints, plain-English explanations of *why* things work, and visual highlights pointing to the next recommended action.

---

## 1. Global Mode State & Navigation Architecture
- **Location:** Integrated directly in `src/components/Navbar.tsx` alongside current system metrics.
- **Control:** A sleek, tactical toggle switch:
  - `[WORKSTATION]` (Clean, data-dense, minimal copy, high scanability)
  - `[GUIDED MODE]` (Interactive assistant, inline collapsible panels, contextual hints, step guidance)
- **Persistence:** Saved in `localStorage` (`sih26237_ui_mode`) so user preferences are preserved across tab reloads.

---

## 2. Reusable Guidance Primitive (`src/components/ui/GuidancePanel.tsx`)
Create a dedicated, high-quality component:
- **Collapsed/Expanded state:** Easily toggled with a single click.
- **Visual Styling:** Clean, military/tactical theme border with soft cyan/amber accents.
- **Contents:**
  - *What is happening on this screen?* (Plain-English summary)
  - *Recommended next step* (e.g., "Select Dr. Alice Vance and click Decrypt")
  - *What to observe* (e.g., "Notice the ML-DSA-65 signature generated on the fly")
  - *Quick Dismiss / Hide button*

---

## 3. Screen-by-Screen Dual-Mode Experience

### A. Sender Studio (`SenderStudio.tsx`)
* **Workstation Mode:**
  - Compact 36px operational status bar (`MODULE: SENDER` • `CIPHER: AES-256-GCM` • `KEM: FIPS 203`).
  - No introductory paragraphs.
  - High-density recipient matrix with clearance tags.
  - Encrypted package summary with one-click JSON inspect drawer.
* **Guided Mode:**
  - Prominent collapsible guide card at top: *"Step 1: How multi-recipient broadcast encryption works."*
  - Interactive hint pills next to recipient checkboxes: *"Select Alice and Bob, but leave Charlie unchecked to test unauthorized rejection later."*
  - Animated pulse on the primary "Generate Package" button when ready.

### B. Recipient Portal (`RecipientPortal.tsx`)
* **Workstation Mode:**
  - Ultra-clean operator selection rail.
  - Compact 6-stage telemetry progress bar ($< 35\text{px}$).
  - Document viewport with clean action buttons (`Inspect Stego`, `Download`, `Simulate Leak`).
* **Guided Mode:**
  - Collapsible guidance card: *"Step 2: Decrypting and binding the invisible forensic watermark."*
  - Step-by-step indicator explaining the 6 pipeline stages in simple terms.
  - Explanatory callout for the **"Inspect Forensic Channel"** feature and what the watermark represents.
  - Guided highlight for the **"Simulate Leak"** button to lead into the forensic investigation.

### C. Forensic Studio (`ForensicStudio.tsx`)
* **Workstation Mode:**
  - Lean ingestion console without redundant tutorial copy.
  - High-density attribution verdict banner (`PERPETRATOR: DR. ALICE VANCE` • `CONFIDENCE: 100%`).
  - Compact cryptographic checklist (`[✓] 0xA55A SYNC` • `[✓] CRC-16` • `[✓] ML-DSA-65 VERIFIED`).
  - Detailed raw proof (Merkle branch, Base64 signature) tucked inside a collapsible inspector drawer.
* **Guided Mode:**
  - Top guidance panel: *"Step 3: How blind forensic extraction catches the leaker."*
  - Explains how zero-width characters are recovered from the text and matched with the blockchain.
  - Step-by-step breakdown of how the certificate proves non-repudiation in legal proceedings.

### D. DLT Explorer (`DltExplorer.tsx`)
* **Workstation Mode:**
  - Sleek 3/3 validator node telemetry dots (`ALPHA: OK`, `BRAVO: OK`, `GAMMA: OK`).
  - Compact block list with block height, Merkle root hash, and transaction badges.
  - Clean one-click buttons for *"Audit Chain"* and *"Simulate Tamper"*.
* **Guided Mode:**
  - Inline guidance panel: *"What is an Air-Gapped DLT and why can't administrators erase logs?"*
  - Explanatory walkthrough of the tamper attack: *"Click Simulate Tamper to see how cryptographic Merkle roots catch rogue database edits."*

### E. PQC Registry (`PqcRegistry.tsx`)
* **Workstation Mode:**
  - High-density table of enrolled defense personnel.
  - Truncated key fingerprints with 1-click copy buttons instead of full raw hex screens.
  - Clean slide-over key inspection modal.
* **Guided Mode:**
  - Guidance panel: *"What are NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA)?"*
  - Explains why legacy RSA and ECC are excluded to protect against quantum computers.

### F. Attack Lab (`SecurityTestHarness.tsx`)
* **Workstation Mode:**
  - High-density security test matrix with execution metrics ($ms$), pass/fail indicators, and one-click run.
  - Diagnostic logs collapsed into an on-demand drawer.
* **Guided Mode:**
  - Guidance panel: *"Adversarial Testing Bench: Testing negative security guarantees."*
  - Plain-English threat descriptions for each of the 7 security vectors.

---

## 4. Verification and Testing
- Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.
- Run `npm run build` to ensure the production bundle builds cleanly.
- Verify toggle responsiveness: switching modes smoothly toggles guidance without losing active document, package, or decryption state.
