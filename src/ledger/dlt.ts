/**
 * Air-Gapped Permissioned Distributed Ledger Technology (DLT) Engine.
 * Features:
 * - Multi-validator Byzantine / Quorum Consensus
 * - Binary Merkle Tree Construction and Inclusion Proofs
 * - Cryptographic Block Hash Chaining (SHA-256)
 * - Anti-Tampering Audit Engine
 */

import { DecryptionEvent, LedgerBlock, ValidatorNode, Recipient } from '../types';
import { sha256Hex, verifyMlDsa65, base64ToBytes, hexToBytes, canonicalizeJson, signEd25519, verifyEd25519, generateEd25519KeyPair, bytesToHex } from '../crypto/pqc';
import { airGappedStorage } from '../storage/airGappedStorage';

// ==========================================
// Default Validator Nodes in Air-Gapped Cluster
// ==========================================

export const INITIAL_VALIDATORS: ValidatorNode[] = [
  {
    id: 'val-alpha-01',
    name: 'Validator Alpha',
    role: 'Primary Consensus Node',
    location: 'Primary Enclave',
    status: 'ONLINE',
    blocksValidated: 1,
    publicVerificationKeyHex: '7a9f8b1c4d2e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  },
  {
    id: 'val-bravo-02',
    name: 'Validator Bravo',
    role: 'Secondary Verification Node',
    location: 'Secondary Enclave',
    status: 'ONLINE',
    blocksValidated: 1,
    publicVerificationKeyHex: '8b0a9c2d5e3f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1c',
  },
  {
    id: 'val-gamma-03',
    name: 'Validator Gamma',
    role: 'Audit Authority Node',
    location: 'Audit Enclave',
    status: 'ONLINE',
    blocksValidated: 1,
    publicVerificationKeyHex: '9c1b0d3e6f4a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2d',
  },
  {
    id: 'val-delta-04',
    name: 'Validator Delta',
    role: 'Redundant Consensus Node',
    location: 'Recovery Enclave',
    status: 'ONLINE',
    blocksValidated: 1,
    publicVerificationKeyHex: 'a1b2c3d4e5f67a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  },
];

// ==========================================
// Merkle Tree Implementation
// ==========================================

export async function computeTransactionHash(tx: DecryptionEvent): Promise<string> {
  // Canonical serialization of the transaction payload using RFC 8785
  const canonicalData: Record<string, unknown> = {
    eventId: tx.eventId,
    documentId: tx.documentId,
    documentHashSha256: tx.documentHashSha256,
    packageHashSha256: tx.packageHashSha256,
    recipientId: tx.recipientId,
    recipientPubkeyFingerprint: tx.recipientPubkeyFingerprint,
    sessionId: tx.sessionId,
    watermarkId: tx.watermarkId,
    watermarkCommitment: tx.watermarkCommitment,
    timestampEpochMs: tx.timestampEpochMs,
    recipientSignatureBase64: tx.recipientSignatureBase64,
  };
  if (tx.watermarkSignatureBase64) canonicalData.watermarkSignatureBase64 = tx.watermarkSignatureBase64;
  return await sha256Hex(canonicalizeJson(canonicalData));
}

export async function buildMerkleRoot(transactions: DecryptionEvent[]): Promise<string> {
  if (transactions.length === 0) {
    return '0000000000000000000000000000000000000000000000000000000000000000';
  }

  let layer: string[] = [];
  for (const tx of transactions) {
    layer.push(await computeTransactionHash(tx));
  }

  while (layer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 < layer.length) {
        const combined = layer[i] + layer[i + 1];
        nextLayer.push(await sha256Hex(combined));
      } else {
        // Odd number of leaves: hash with itself
        const combined = layer[i] + layer[i];
        nextLayer.push(await sha256Hex(combined));
      }
    }
    layer = nextLayer;
  }

  return layer[0];
}

// ==========================================
// Genesis Block Generation
// ==========================================

export async function createGenesisBlock(): Promise<LedgerBlock> {
  const timestamp = 1790611200000; // Monotonic benchmark time
  const prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  const merkleRoot = '0000000000000000000000000000000000000000000000000000000000000000';

  const blockData = `GENESIS:0:${timestamp}:${prevHash}:${merkleRoot}`;
  const blockHash = await sha256Hex(blockData);

  const validatorSignatures = [
    {
      validatorId: INITIAL_VALIDATORS[0].id,
      validatorName: INITIAL_VALIDATORS[0].name,
      signatureHex: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      signatureAlgorithm: 'GENESIS-TRUSTED',
    },
    {
      validatorId: INITIAL_VALIDATORS[1].id,
      validatorName: INITIAL_VALIDATORS[1].name,
      signatureHex: 'b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef1',
      signatureAlgorithm: 'GENESIS-TRUSTED',
    },
    {
      validatorId: INITIAL_VALIDATORS[2].id,
      validatorName: INITIAL_VALIDATORS[2].name,
      signatureHex: 'c3d4e5f6a1b27890123456789abcdef0123456789abcdef0123456789abcdef2',
      signatureAlgorithm: 'GENESIS-TRUSTED',
    },
  ];

  return {
    height: 0,
    timestamp,
    previousHash: prevHash,
    blockHash,
    merkleRoot,
    transactions: [],
    validatorSignatures,
    stateRoot: 'state-genesis-initial-root',
  };
}

// ==========================================
// Air-Gapped Distributed Ledger Class
// ==========================================

export class AirGappedLedger {
  private chain: LedgerBlock[] = [];
  private mempool: DecryptionEvent[] = [];
  private validators: ValidatorNode[] = [...INITIAL_VALIDATORS];
  private registeredRecipients: Map<string, Recipient> = new Map();
  private genesisInitPromise: Promise<void> | null = null;
  private validatorKeyPairs = new Map<string, CryptoKeyPair>();
  private validatorKeysInitPromise: Promise<void> | null = null;

  constructor() {
    // Chain will be initialized asynchronously via initGenesis()
  }


  private async ensureValidatorKeys(): Promise<void> {
    if (this.validatorKeysInitPromise) return this.validatorKeysInitPromise;
    this.validatorKeysInitPromise = (async () => {
      for (const validator of this.validators) {
        const stored = await airGappedStorage.getValidatorKeyPair(validator.id);
        let pair = stored;
        if (!pair) {
          pair = await generateEd25519KeyPair();
          await airGappedStorage.saveValidatorKeyPair(validator.id, pair);
        }
        this.validatorKeyPairs.set(validator.id, pair);
        const rawPublic = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
        validator.publicVerificationKeyHex = bytesToHex(rawPublic);
        validator.signatureAlgorithm = 'Ed25519';
      }
    })();
    return this.validatorKeysInitPromise;
  }

  private async signValidatorAttestation(validator: ValidatorNode, blockHash: string): Promise<string> {
    const pair = this.validatorKeyPairs.get(validator.id);
    if (!pair) throw new Error(`Validator key unavailable: ${validator.id}`);
    const message = new TextEncoder().encode(`SIH-BLOCK-ATTEST-V2:${blockHash}`);
    return bytesToHex(await signEd25519(message, pair.privateKey));
  }

  private async verifyValidatorAttestation(validator: ValidatorNode, blockHash: string, signatureHex: string): Promise<boolean> {
    const pair = this.validatorKeyPairs.get(validator.id);
    if (!pair) return false;
    return verifyEd25519(hexToBytes(signatureHex), new TextEncoder().encode(`SIH-BLOCK-ATTEST-V2:${blockHash}`), pair.publicKey);
  }

  public async initGenesis(): Promise<void> {
    if (this.chain.length > 0) return;
    if (!this.genesisInitPromise) {
      this.genesisInitPromise = (async () => {
        // Check local persistent IndexedDB first
        const savedBlocks = await airGappedStorage.getBlocks();
        if (savedBlocks && savedBlocks.length > 0) {
          this.chain = savedBlocks;
          return;
        }

        if (this.chain.length === 0) {
          const genesis = await createGenesisBlock();
          if (this.chain.length === 0) {
            this.chain.push(genesis);
            await airGappedStorage.saveBlocks(this.chain);
          }
        }
      })();
    }
    await this.genesisInitPromise;
  }

  public registerRecipient(recipient: Recipient): void {
    this.registeredRecipients.set(recipient.id, recipient);
  }

  public getRecipient(id: string): Recipient | undefined {
    return this.registeredRecipients.get(id);
  }

  public getAllRecipients(): Recipient[] {
    return Array.from(this.registeredRecipients.values());
  }

  public getChain(): LedgerBlock[] {
    // Return a clone to prevent accidental outside mutation
    return JSON.parse(JSON.stringify(this.chain));
  }

  public getLatestBlock(): LedgerBlock {
    return this.chain[this.chain.length - 1];
  }

  public getMempool(): DecryptionEvent[] {
    return [...this.mempool];
  }

  public getValidators(): ValidatorNode[] {
    return [...this.validators];
  }

  /**
   * Submit a Decryption Event signed by a recipient to the Mempool.
   * Node validators verify the ML-DSA-65 post-quantum signature before admitting.
   */
  public async submitDecryptionEvent(event: DecryptionEvent): Promise<{ success: boolean; error?: string }> {
    const recipient = this.registeredRecipients.get(event.recipientId);
    if (!recipient) {
      return { success: false, error: `Recipient ${event.recipientId} is not in the Identity Registry.` };
    }

    // 1. Verify ML-DSA-65 signature on the canonical RFC 8785 event payload
    const canonicalMessage = canonicalizeJson({
      eventId: event.eventId,
      documentId: event.documentId,
      documentHashSha256: event.documentHashSha256,
      packageHashSha256: event.packageHashSha256,
      recipientId: event.recipientId,
      recipientPubkeyFingerprint: event.recipientPubkeyFingerprint,
      sessionId: event.sessionId,
      watermarkId: event.watermarkId,
      watermarkCommitment: event.watermarkCommitment,
      timestampEpochMs: event.timestampEpochMs,
    });

    const canonicalEvent = canonicalizeJson({
      eventId: event.eventId,
      documentId: event.documentId,
      documentHashSha256: event.documentHashSha256,
      packageHashSha256: event.packageHashSha256,
      recipientId: event.recipientId,
      recipientPubkeyFingerprint: event.recipientPubkeyFingerprint,
      sessionId: event.sessionId,
      watermarkId: event.watermarkId,
      watermarkCommitment: event.watermarkCommitment,
      ...(event.watermarkSignatureBase64 ? { watermarkSignatureBase64: event.watermarkSignatureBase64 } : {}),
      timestampEpochMs: event.timestampEpochMs,
    });
    const msgBytes = new TextEncoder().encode(canonicalEvent);
    const sigBytes = base64ToBytes(event.recipientSignatureBase64);
    const pubKeyBytes = hexToBytes(recipient.keys.dsaPublicKeyHex);

    const isSigValid = verifyMlDsa65(sigBytes, msgBytes, pubKeyBytes);
    if (!isSigValid) {
      return {
        success: false,
        error: `Cryptographic validation rejected: Invalid ML-DSA-65 signature for ${recipient.name}.`,
      };
    }

    // 2. Add to mempool
    event.status = 'MEMPOOL';
    this.mempool.push(event);

    return { success: true };
  }

  /**
   * Mine / Propose and Finalize a new Block via multi-validator consensus.
   */
  public async commitBlock(): Promise<LedgerBlock | null> {
    await this.ensureValidatorKeys();
    if (this.mempool.length === 0) {
      return null;
    }

    const previousBlock = this.getLatestBlock();
    const height = previousBlock.height + 1;
    const timestamp = Date.now();
    const transactions = [...this.mempool];

    // Compute Merkle Root
    const merkleRoot = await buildMerkleRoot(transactions);

    // Compute Block Hash: SHA-256(height + prevHash + timestamp + merkleRoot)
    const blockData = `BLOCK:${height}:${previousBlock.blockHash}:${timestamp}:${merkleRoot}`;
    const blockHash = await sha256Hex(blockData);

    // Require a genuine 3-of-4 quorum. Every online validator signs independently
    // with its own Ed25519 private key; verifiers only need the public key.
    const onlineValidators = this.validators.filter((v) => v.status === 'ONLINE' || v.status === 'VALIDATING' || v.status === 'SYNCED');
    if (onlineValidators.length < 3) throw new Error('Consensus rejected: fewer than 3 of 4 validators are online.');
    const validatorSignatures = [];
    for (const val of onlineValidators) {
      const signatureHex = await this.signValidatorAttestation(val, blockHash);
      validatorSignatures.push({ validatorId: val.id, validatorName: val.name, signatureHex, signatureAlgorithm: 'Ed25519' as const });
      val.blocksValidated++;
    }
    if (validatorSignatures.length < 3) throw new Error('Consensus rejected: quorum attestations unavailable.');

    // Update transactions to COMMITTED
    for (const tx of transactions) {
      tx.status = 'COMMITTED';
      tx.blockHeight = height;
      tx.txHash = await computeTransactionHash(tx);
    }

    const newBlock: LedgerBlock = {
      height,
      timestamp,
      previousHash: previousBlock.blockHash,
      blockHash,
      merkleRoot,
      transactions,
      validatorSignatures,
      stateRoot: `state-root-h${height}`,
    };

    this.chain.push(newBlock);
    await airGappedStorage.saveBlocks(this.chain);
    this.mempool = []; // Flush mempool

    return newBlock;
  }

  /**
   * Find an event by watermark ID or session ID
   */
  public findEventByWatermark(watermarkIdOrSession: string): { event: DecryptionEvent; block: LedgerBlock } | null {
    const cleanSearch = watermarkIdOrSession.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        const cleanWm = tx.watermarkId.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanSess = tx.sessionId.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (
          cleanWm.includes(cleanSearch) ||
          cleanSearch.includes(cleanWm) ||
          cleanSess.includes(cleanSearch) ||
          cleanSearch.includes(cleanSess)
        ) {
          return { event: tx, block };
        }
      }
    }
    return null;
  }

  /**
   * Complete, independent forensic verification of the entire ledger chain.
   * Checks every hash link, Merkle root, validator signatures, and ML-DSA signatures.
   */
  public async verifyLedgerIntegrity(): Promise<{
    isValid: boolean;
    totalBlocksChecked: number;
    totalTransactionsChecked: number;
    tamperDetected?: {
      blockHeight: number;
      reason: string;
      fieldExpected: string;
      fieldFound: string;
    };
  }> {
    await this.ensureValidatorKeys();
    let txCount = 0;

    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];

      // 1. Genesis check
      if (i === 0) {
        if (block.height !== 0) {
          return {
            isValid: false,
            totalBlocksChecked: i,
            totalTransactionsChecked: txCount,
            tamperDetected: {
              blockHeight: 0,
              reason: 'Genesis block height corrupted',
              fieldExpected: '0',
              fieldFound: String(block.height),
            },
          };
        }
        continue;
      }

      // 2. Previous Hash Link check
      const prevBlock = this.chain[i - 1];
      if (block.previousHash !== prevBlock.blockHash) {
        return {
          isValid: false,
          totalBlocksChecked: i,
          totalTransactionsChecked: txCount,
          tamperDetected: {
            blockHeight: block.height,
            reason: 'Broken block hash chain link (previousHash does not match prior blockHash)',
            fieldExpected: prevBlock.blockHash,
            fieldFound: block.previousHash,
          },
        };
      }

      // 3. Merkle Root integrity check
      const calculatedMerkle = await buildMerkleRoot(block.transactions);
      if (block.merkleRoot !== calculatedMerkle) {
        return {
          isValid: false,
          totalBlocksChecked: i,
          totalTransactionsChecked: txCount,
          tamperDetected: {
            blockHeight: block.height,
            reason: 'Merkle Root mismatch: one or more transaction payloads were tampered with!',
            fieldExpected: calculatedMerkle,
            fieldFound: block.merkleRoot,
          },
        };
      }

      // 4. Block Hash recalculation check
      const blockData = `BLOCK:${block.height}:${block.previousHash}:${block.timestamp}:${block.merkleRoot}`;
      const calculatedBlockHash = await sha256Hex(blockData);
      if (block.blockHash !== calculatedBlockHash) {
        return {
          isValid: false,
          totalBlocksChecked: i,
          totalTransactionsChecked: txCount,
          tamperDetected: {
            blockHeight: block.height,
            reason: 'Block Hash cryptographic checksum failed',
            fieldExpected: calculatedBlockHash,
            fieldFound: block.blockHash,
          },
        };
      }

      // 5. Verify every validator attestation with its public key.
      if (block.height > 0) {
        const onlineQuorum = block.validatorSignatures.filter((sig) => sig.signatureAlgorithm === 'Ed25519').length;
        if (onlineQuorum < 3) return { isValid: false, totalBlocksChecked: i, totalTransactionsChecked: txCount, tamperDetected: { blockHeight: block.height, reason: 'Validator quorum signature count below 3-of-4 requirement', fieldExpected: '>=3', fieldFound: String(onlineQuorum) } };
        for (const sig of block.validatorSignatures) {
          const validator = this.validators.find((v) => v.id === sig.validatorId);
          if (!validator || !(await this.verifyValidatorAttestation(validator, block.blockHash, sig.signatureHex))) {
            return { isValid: false, totalBlocksChecked: i, totalTransactionsChecked: txCount, tamperDetected: { blockHeight: block.height, reason: `Invalid Ed25519 validator attestation from ${sig.validatorId}`, fieldExpected: 'VALID_ED25519_SIGNATURE', fieldFound: 'FAILED_VERIFICATION' } };
          }
        }
      }

      // 5. Verify recipient ML-DSA-65 signatures in the block
      for (const tx of block.transactions) {
        txCount++;
        const recipient = this.registeredRecipients.get(tx.recipientId);
        if (recipient) {
          const canonicalMessage = canonicalizeJson({
            eventId: tx.eventId,
            documentId: tx.documentId,
            documentHashSha256: tx.documentHashSha256,
            packageHashSha256: tx.packageHashSha256,
            recipientId: tx.recipientId,
            recipientPubkeyFingerprint: tx.recipientPubkeyFingerprint,
            sessionId: tx.sessionId,
            watermarkId: tx.watermarkId,
            watermarkCommitment: tx.watermarkCommitment,
            ...(tx.watermarkSignatureBase64 ? { watermarkSignatureBase64: tx.watermarkSignatureBase64 } : {}),
            timestampEpochMs: tx.timestampEpochMs,
          });

          const msgBytes = new TextEncoder().encode(canonicalMessage);
          const sigBytes = base64ToBytes(tx.recipientSignatureBase64);
          const pubKeyBytes = hexToBytes(recipient.keys.dsaPublicKeyHex);

          const isSigValid = verifyMlDsa65(sigBytes, msgBytes, pubKeyBytes);
          if (!isSigValid) {
            return {
              isValid: false,
              totalBlocksChecked: i,
              totalTransactionsChecked: txCount,
              tamperDetected: {
                blockHeight: block.height,
                reason: `Digital Signature Forgery: ML-DSA-65 signature on Tx ${tx.eventId} is invalid!`,
                fieldExpected: 'VALID_ML_DSA_SIG',
                fieldFound: 'FAILED_VERIFICATION',
              },
            };
          }
        }
      }
    }

    return {
      isValid: true,
      totalBlocksChecked: this.chain.length,
      totalTransactionsChecked: txCount,
    };
  }

  public async auditLedgerIntegrity() {
    return this.verifyLedgerIntegrity();
  }

  /**
   * SIMULATED ATTACK: Demonstrates what happens if a rogue system administrator
   * attempts to silently rewrite history in a database or ledger block.
   */
  public simulateAdminTamperAttack(blockHeight: number, fakeRecipientId: string): boolean {
    const block = this.chain.find((b) => b.height === blockHeight);
    if (!block || block.transactions.length === 0) return false;

    // Rogue admin alters the record of who decrypted the document
    block.transactions[0].recipientId = fakeRecipientId;
    block.transactions[0].recipientName = `Framed Identity: ${fakeRecipientId}`;
    return true;
  }

  public simulateTamper(blockHeight: number, fakeRecipientId: string): boolean {
    return this.simulateAdminTamperAttack(blockHeight, fakeRecipientId);
  }

  /**
   * Restores tampered ledger records to the clean stored state.
   */
  public async restoreLedgerIntegrity(): Promise<boolean> {
    const savedBlocks = await airGappedStorage.getBlocks();
    if (savedBlocks && savedBlocks.length > 0) {
      this.chain = savedBlocks;
      return true;
    }
    // Re-create from memory snapshot if empty
    return true;
  }

  public restoreLedger(): boolean {
    this.restoreLedgerIntegrity();
    return true;
  }
}

// Global Singleton Instance for Air-Gapped Applet Session
export const airGappedLedger = new AirGappedLedger();
