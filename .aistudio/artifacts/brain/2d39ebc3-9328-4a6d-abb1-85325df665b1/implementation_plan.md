# Plain-English Language Simplification Plan: Guided Tour

## Executive Summary & Core Principles

The goal of this plan is to eliminate unnecessary cryptographic jargon and complex military phrasings throughout the **Guided Tour** and **Walkthrough components**, ensuring that a complete beginner with **zero technical or cryptographic background** can immediately understand:
* What the app does
* What is happening on screen
* What they need to do next
* Why each action is important
* What will happen immediately after they complete an action

### Guiding Plain-English Rules:
1. **Short, conversational sentences**: Break long compound sentences into bite-sized thoughts.
2. **Everyday analogies instead of algorithm names**:
   * *NIST FIPS 203 (ML-KEM-768)* $\rightarrow$ **"Future-proof digital lock"**
   * *Dynamic Steganography* $\rightarrow$ **"Invisible digital stamp / invisible watermark"**
   * *Decapsulate CEK & Bind Provenance* $\rightarrow$ **"Unlock document with private key"**
   * *Air-Gapped 3/3 DLT Quorum* $\rightarrow$ **"Tamper-proof logbook (copied across 3 secure computers)"**
   * *Blind Forensic Attribution* $\rightarrow$ **"Digital blacklight scan"**
   * *SSIM / Invariance Audit* $\rightarrow$ **"Visual check (making sure text looks 100% normal to the reader)"**
3. **Direct imperative calls-to-action**: Tell the user exactly which button to click and where it is located.
4. **Friendly, encouraging feedback**: Confirm success with plain words (*"Great job!"*, *"You did it!"*) before explaining what happened.

---

## 1. Intro Modal Simplification (`GuidedTourIntroModal.tsx`)

| Element | Current Technical Wording | Proposed Simplified Wording | Reason for Change |
| :--- | :--- | :--- | :--- |
| **Top Badge** | `Beginner Interactive Detective Tour` | `Quick 3-Minute Interactive Tour` | Shorter, sets an explicit, low-stress time expectation. |
| **Main Title** | `Catching an Anonymous Document Leaker` | `How to Catch a Secret Document Leaker` | More active, conversational, and intriguing. |
| **Welcome Paragraph** | *"Welcome to AEGIS-PQC. You are about to discover how modern defense intelligence uses post-quantum mathematics and invisible digital watermarks to catch unauthorized leakers with mathematical certainty."* | *"Welcome! When confidential files are sent to multiple people and someone leaks them online, all copies normally look identical—making it impossible to know who did it.<br><br>In this quick tour, you'll see how we use invisible digital watermarks to catch the leaker red-handed."* | Removes intimidating words like *"defense intelligence"*, *"post-quantum mathematics"*, and *"mathematical certainty"*. Explains the actual core problem in simple terms. |
| **Card 1** | *"Lock the Safe: Put a top-secret file in a quantum-safe digital safe with separate keys for Alice and Bob."* | **1. Lock the Document**<br>Put a secret file inside a digital safe. We give personal keys only to Alice and Bob. | Shorter and cleaner. |
| **Card 2** | *"Secret Digital Stamp: When Alice and Bob unlock the file, invisible watermarks are stamped between words."* | **2. Stamp Invisible Watermark**<br>When they open the file, an invisible code is stamped between the words on their screen. | Explains clearly that the stamp is in the words themselves. |
| **Card 3** | *"The Traitor Leaks: Col. Bob leaks his copy online, believing nobody can trace it back to him."* | **3. Bob Leaks His Copy**<br>Bob shares his copy on a public website, thinking nobody can tell it came from him. | Replaces *"traitor"* and *"online forum"* with everyday phrasing. |
| **Card 4** | *"Forensic Attribution: Scan the leak under our forensic blacklight to catch Bob red-handed with 100% confidence."* | **4. Catch the Leaker**<br>Scan the leaked text to reveal Bob's hidden watermark and prove his guilt. | Removes technical term *"forensic attribution"*. |
| **Bottom Callout** | *"Zero technical background needed! We use simple everyday language, clear step-by-step guidance, and 1-click helpers if you ever get stuck."* | *"No tech skills needed! Follow the simple steps, or click 'Do for me' at any time to let the app do the work."* | Reassuring, punchy, and highlights the failsafe helper. |
| **Primary Button**| `Start Interactive Guided Tour` | `Start the Tour →` | Clear, direct, action-oriented. |
| **Skip Button** | `I'm an expert, skip to full workstation` | `Skip tour and explore on my own` | Friendly, not condescending to non-experts. |

---

## 2. Floating Mission Guide Simplification (`FloatingMissionGuide.tsx`)

| Element | Current Technical Wording | Proposed Simplified Wording | Reason for Change |
| :--- | :--- | :--- | :--- |
| **Header Badge** | `GUIDED DETECTIVE MISSION • STEP 1 OF 5` | `STEP 1 OF 5 • DETECTIVE STORY` | Shorter, easy to read on mobile or smaller screens. |
| **Scenario Header** | `The Real-World Scenario:` | `What's happening:` | More natural conversational English. |
| **Action Header** | `Your Next Action:` | `What you should do:` | Direct and clear. |
| **Importance Header**| `Why this is important:` | `Why this matters:` | Simpler and faster to scan. |
| **Technical Drawer** | `Behind the Scenes (Cryptographic Engine)` | `For curious learners: What the math did` | Welcoming rather than intimidating jargon. |
| **Do for me Button** | `Do for me` (icon + text) | `⚡ Auto-do this step` | Makes it immediately obvious that it will execute the action for them. |
| **Next Step Button** | `Next Step →` / `Finish Tour` | `Continue to Next Step →` / `Done! Explore the App` | Clear sense of forward movement. |

---

## 3. Step-by-Step Tour Content Simplification (`src/types/tour.ts`)

### Step 1: Locking the Document (Sender Studio)
* **Title**:
  * *Current*: `Locking the Classified Document`
  * *Simplified*: `Step 1: Lock the Secret Document`
* **Story / Context**:
  * *Current*: *"Imagine locking a secret file inside a high-tech safe box. Instead of giving everyone the same key combination, the safe creates a unique digital keyhole for each person you authorize."*
  * *Simplified*: *"Imagine placing a secret file into a super-secure safe box. Instead of giving everyone the same key, the safe creates a separate digital key for each person you select."*
* **Target Objective (What to do)**:
  * *Current*: *"Select the top document, check Dr. Alice Vance and Col. Bob Martinez, then click 'Generate Encrypted Package'."*
  * *Simplified*: *"1. Click the first document on the left.<br>2. Check Alice and Bob (leave Charlie unchecked).<br>3. Click the glowing button: **'Generate Encrypted Package'**."*
* **Why this matters**:
  * *Current*: *"If anyone without a key (like Charlie) intercepts the file, it looks like complete static gibberish that even future quantum supercomputers cannot crack."*
  * *Simplified*: *"Because Charlie was not checked, he has no key. If he steals the file, he sees only scrambled gibberish that even future supercomputers cannot crack."*
* **What happens next**:
  * *New feedback explanation*: *"The document is now locked! Alice and Bob each have their own digital key. Next, we will see Alice unlock her copy."*

---

### Step 2: Alice Opens Her Copy (Recipient Portal)
* **Title**:
  * *Current*: `Alice Opens Her Copy (Zero-Width Watermark)`
  * *Simplified*: `Step 2: Alice Opens Her Copy`
* **Story / Context**:
  * *Current*: *"When Alice uses her key to unlock the file, her screen secretly stamps an invisible code (zero-width characters) into the document before showing it to her. To Alice, the text looks 100% normal."*
  * *Simplified*: *"When Alice uses her key to open the file, her screen secretly adds an invisible watermark between the words. To Alice's eyes, the document looks completely normal."*
* **Target Objective (What to do)**:
  * *Current*: *"Select Dr. Alice Vance, click 'Decrypt & Bind Provenance Event', then switch on the 'Inspect Steganographic Channel' toggle to see the hidden stamp."*
  * *Simplified*: *"1. Click on **Dr. Alice Vance**.<br>2. Click the glowing button: **'Decrypt & View Document'**.<br>3. Click **'Inspect Stego Channel'** to see her hidden watermark."*
* **Why this matters**:
  * *Current*: *"Because the watermark is embedded dynamically right when Alice unlocks the file, she cannot share or screenshot it without carrying her secret digital fingerprint."*
  * *Simplified*: *"Even if Alice copies the text or takes a screenshot, her secret invisible stamp is embedded in the words. We will always know this copy was hers."*
* **What happens next**:
  * *New feedback explanation*: *"Alice has opened her copy safely. Now let's switch to Bob, who will also open his copy—and decide to leak it!"*

---

### Step 3: Bob Decrypts and Leaks the Document (Recipient Portal)
* **Title**:
  * *Current*: `Bob Decrypts and Leaks His Copy`
  * *Simplified*: `Step 3: Bob Leaks His Copy Online`
* **Story / Context**:
  * *Current*: *"Now Col. Bob opens the same document. His screen stamps his own unique watermark. Believing his copy is anonymous, Bob decides to leak the file to an online forum!"*
  * *Simplified*: *"Bob opens the same document using his own key. His screen stamps his unique watermark. Believing nobody can trace it back to him, Bob leaks his copy online!"*
* **Target Objective (What to do)**:
  * *Current*: *"Switch to Col. Bob Martinez, click 'Decrypt & Bind Provenance Event', and then click the red button 'Simulate Leak of Bob's Copy'."*
  * *Simplified*: *"1. Click on **Col. Bob Martinez**.<br>2. Click **'Decrypt & View Document'**.<br>3. Click the red button: **'Simulate Leak of Bob's Copy'**."*
* **Why this matters**:
  * *Current*: *"Both Alice and Bob read the exact same words on screen. Bob has no idea his personal identity is invisibly stitched into the document text."*
  * *Simplified*: *"Alice and Bob saw the exact same words on their screens. But Bob has no idea that his identity is invisibly hidden between the words of his copy."*
* **What happens next**:
  * *New feedback explanation*: *"The leaked text has been copied to our Forensic Lab! Let's scan it to find out who leaked it."*

---

### Step 4: Scanning the Leaked Text (Forensic Lab)
* **Title**:
  * *Current*: `Scanning the Leaked Text & Proving the Culprit`
  * *Simplified*: `Step 4: Scan the Leak & Catch the Culprit`
* **Story / Context**:
  * *Current*: *"The military intelligence unit discovers an anonymous leaked text on the internet. We put the leaked text under our forensic digital blacklight to discover who leaked it."*
  * *Simplified*: *"Security officers found an anonymous leaked document on the internet. We run this text through our digital scanner to see whose invisible watermark is inside."*
* **Target Objective (What to do)**:
  * *Current*: *"Click the bright 'Execute Blind Forensic Attribution' button to scan the leaked text."*
  * *Simplified*: *"Click the glowing button: **'Scan Leaked Text & Identify Source'**."*
* **Why this matters**:
  * *Current*: *"The scanner extracts Bob’s hidden watermark, checks the tamper-proof ledger, and proves mathematically in court that Bob was the source with 100% confidence."*
  * *Simplified*: *"The scanner immediately finds Bob's hidden watermark and checks our secure records. We now have 100% indisputable proof that Bob leaked the file."*
* **What happens next**:
  * *New feedback explanation*: *"Bob is caught! But what if Bob tries to get an IT friend to delete his name from the system logs? Let's test that in Step 5."*

---

### Step 5: Can Bob Erase the Evidence? (Air-Gapped Ledger)
* **Title**:
  * *Current*: `Can Bob’s Accomplice Erase the Evidence?`
  * *Simplified*: `Step 5: Can Anyone Erase the Records?`
* **Story / Context**:
  * *Current*: *"What if Bob has a friend in the IT department who tries to edit the database logs to frame someone else or erase Bob’s name? Watch what happens when someone tampers with the history book."*
  * *Simplified*: *"What if Bob's friend in IT tries to modify the database to erase Bob's name? Watch what happens when an attacker tries to tamper with the records."*
* **Target Objective (What to do)**:
  * *Current*: *"Click 'Simulate Rogue Admin Tamper', then click 'Audit Entire Ledger' to see the security alarm trigger immediately."*
  * *Simplified*: *"1. Click the red button: **'Simulate Rogue Admin Tamper'**.<br>2. Click **'Audit Entire Ledger'** to watch the tamper alarm sound immediately.<br>3. Click **'Restore Quorum Integrity'** to fix it."*
* **Why this matters**:
  * *Current*: *"Because the ledger is synchronized across 3 independent validator computers using cryptographic hash chains, any modified letter breaks the mathematical math tree immediately."*
  * *Simplified*: *"Because the record is synchronized across 3 independent computers, changing even a single letter breaks the mathematical chain and gets rejected instantly."*
* **What happens next**:
  * *New feedback explanation*: *"Integrity restored! You have completed the tour and learned how secret documents are protected, watermarked, and traced."*

---

## 4. Pipeline Stages Simplification in Mission Control (`WalkthroughTab.tsx`)

| Stage Number | Current Technical Stage Name | Current Technical Subtext | Proposed Simplified Name | Proposed Simplified Subtext |
| :---: | :--- | :--- | :--- | :--- |
| **Stage 1** | `Broadcast Encrypt` | `AES-256-GCM + ML-KEM-768` | **Lock Document** | *Create 1 safe with separate keys* |
| **Stage 2** | `Alice Decapsulates` | `Dynamic stego & ML-DSA sign` | **Alice Opens File** | *Stamps Alice's secret watermark* |
| **Stage 3** | `Bob Decapsulates` | `Distinct session payload` | **Bob Opens File** | *Stamps Bob's secret watermark* |
| **Stage 4** | `Invariance Audit` | `SSIM: 0.9998 verified` | **Visual Check** | *Documents look 100% identical* |
| **Stage 5** | `Blind Attribution` | `Leak resolved via DLT proof` | **Scan Leaked Copy** | *Bob caught with 100% proof* |

---

## 5. Summary of Simplification Benefits

1. **Accessibility**: A student, journalist, manager, or military analyst with zero cryptography training can follow the entire flow in 3 minutes.
2. **Confidence**: Every step tells the user **what they see**, **what to do**, and **what will happen next**.
3. **No Dead Ends**: The `⚡ Auto-do this step` button remains available on every single step if the user prefers to watch the action rather than click manually.
4. **Preserved Depth**: Cryptographic accuracy is not lost; technical details (`ML-KEM-768`, `Merkle Proofs`, `CRC-16`, `SHA-256`) are kept cleanly tucked into the expandable **"For curious learners"** drawer.
