# Beginner-Friendly Verification Plan: How to Test the Project

**Goal:** Verify that every part of the post-quantum encrypted document distribution, invisible watermarking, immutable blockchain, and leak attribution system is working as intended.

---

### Step 1: Automated Guided Tour ("Mission Demo")
- **Where:** Click **"Mission Demo"** in the top navigation bar.
- **Action:** Click the green **"Run Full Lifecycle Simulation"** button.
- **What to look for:**
  - Watch the 5-step progress bar animate through:
    1. *Package Creation* (encrypting for Alice & Bob)
    2. *Recipient Decryption* (Bob unlocks his copy)
    3. *Dynamic Watermark Injection* (invisible fingerprint added)
    4. *Blockchain Consensus* (3/3 validator nodes agree)
    5. *Forensic Extraction* (detecting Bob as the leaker)
  - You will see confetti and a green verification badge confirm the complete lifecycle in under 5 seconds.

---

### Step 2: Test Encrypting a Secret Document ("Sender Studio")
- **Where:** Click **"Sender Studio"** in the top navigation bar.
- **Action:**
  1. Select a classified document from the list (e.g., *Operation Aegis*).
  2. In Step 2, check the boxes for **Dr. Alice Vance** and **Col. Bob Martinez** (leave Cmdr. Charlie Chen unchecked).
  3. Click **"Generate Encrypted Distribution Package"**.
- **What to look for:**
  - A green badge saying **"Package Ready"**.
  - Review the recipient envelopes: you will see individual ML-KEM-768 lockboxes created specifically for Alice and Bob.
  - Click **"Download Package (.sihpkg)"** to see that the app can export a real standalone file for offline transfer.

---

### Step 3: Test Decryption & Invisible Watermarking ("Recipient Portal")
- **Where:** Click **"Recipient Portal"** in the top navigation bar.
- **Action 1 (Authorized Recipient):**
  1. Select **Col. Bob Martinez**. Notice the green badge says *"Envelope Found"*.
  2. Click **"Decrypt & Bind Provenance Event"**.
  3. Watch the 5-step decryption pipeline execute: KEM key recovery -> AES decryption -> invisible watermark embedding -> Bob's digital signature -> Blockchain commit.
  4. Once decrypted, click **"Inspect Stego Channel"** above the document text.
- **What to look for:**
  - A yellow box will appear showing the secret session ID and watermark ID hidden inside the text.
- **Action 2 (Unauthorized Recipient):**
  1. Switch the persona to **Amb. Diana Ross** (who was never added to the package).
  2. Notice the button is disabled and displays a red warning: *"No Key Envelope"*. This proves that unauthorized people cannot decrypt the file.

---

### Step 4: Catch the Leaker ("Forensic Studio")
- **Where:** Click **"Recipient Portal"**, and on Bob's decrypted document, click the red button: **"Simulate Leak of Bob's Copy"**.
- **Action:** The app automatically takes you to the **"Forensic Studio"** with Bob's leaked text pre-filled. Click **"Execute Blind Forensic Attribution"**.
- **What to look for:**
  - The system scans the text, pulls out the hidden watermark, and queries the blockchain.
  - A red **"CRIMINAL LEAK ATTRIBUTED WITH INDISPUTABLE PROOF"** alert appears.
  - It correctly names **Col. Bob Martinez** as the source with **99.9% confidence**.
  - All 4 verification steps (Watermark Header, Ledger Audit, Merkle Tree Proof, and Post-Quantum Signature) show green checkmarks.
  - Click **"Download Certificate (.json)"** to verify that a legal evidence file can be saved.

---

### Step 5: Verify the Blockchain & Audit History ("DLT Explorer")
- **Where:** Click **"DLT Explorer"** in the top navigation bar.
- **Action:**
  1. Look at the chain of blocks (Block #0 Genesis, Block #1, Block #2, etc.).
  2. Click on the latest block to expand it: see the exact Decryption Event transaction, timestamp, and Merkle root.
  3. Click the green **"Audit Entire Ledger Chain"** button at the top right.
- **What to look for:**
  - The system recalculates every single cryptographic hash from block 0 to the top and confirms: *"All blocks cryptographically intact. 0 administrative tampering detected."*
  - *(Optional Test)* Click **"Simulate Admin Tamper Attack"** on Block #1. The chain will immediately turn RED and flag an alarm, proving that even a system administrator cannot silently alter records! Click *"Revert Tamper Attack"* to restore it.

---

### Step 6: Test Real Attacks in the Cyber Lab ("Attack Lab")
- **Where:** Click **"Attack Lab"** in the top navigation bar.
- **Action:** Click the red **"Run All Security Tests"** button.
- **What to look for:**
  - Watch 7 real-world cyber attacks get executed and defeated in real time:
    1. *Unauthorized Recipient Decryption Defense* -> **PASSED**
    2. *Cross-Recipient Key Mismatch* -> **PASSED**
    3. *Ciphertext Bit-Flip Tamper Resistance* -> **PASSED**
    4. *Post-Quantum Signature Forgery Defense* -> **PASSED**
    5. *Historical Ledger Block Rewriting Detection* -> **PASSED**
    6. *Unwatermarked Document Clean Rejection* -> **PASSED**
    7. *Steganographic Bit-Tampering Detection* -> **PASSED**
