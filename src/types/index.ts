/**
 * Core type definitions for Post-Quantum Cryptographic Attribution
 * and Immutable Decryption Provenance System.
 */

export type UiMode = 'workstation' | 'guided';

export interface EncryptedKeystoreEnvelope {
  saltHex: string;
  ivHex: string;
  encryptedKemSecretBase64: string;
  encryptedDsaSecretBase64: string;
  kdf: 'PBKDF2-SHA256-100K';
  cipher: 'AES-256-GCM';
}

export interface RecipientKeyMetadata {
  kemAlgorithm: 'ML-KEM-768';
  kemPublicKeyHex: string;
  kemSecretKeyHex?: string; // Volatile unlocked state
  dsaAlgorithm: 'ML-DSA-65';
  dsaPublicKeyHex: string;
  dsaSecretKeyHex?: string; // Volatile unlocked state
  encryptedKeystore?: EncryptedKeystoreEnvelope; // Encrypted at rest
  keyFingerprint: string;
  registeredAt: number;
}

export interface Recipient {
  id: string;
  name: string;
  role: string;
  organization: string;
  clearanceLevel: 'TOP SECRET // SCI' | 'SECRET' | 'CONFIDENTIAL' | 'RESTRICTED';
  avatarInitials: string;
  isUnlocked?: boolean;
  keys: RecipientKeyMetadata;
}

export interface RecipientEnvelope {
  recipientId: string;
  recipientName: string;
  kemCiphertextBase64: string;
  wrappedCekBase64: string;
  kemAlgorithm: 'ML-KEM-768';
}

export interface EncryptedPackage {
  packageId: string;
  documentId: string;
  documentTitle: string;
  classification: string;
  version: number;
  originalDocumentHashSha256: string;
  ciphertextBase64: string;
  ivHex: string;
  tagHex: string;
  envelopes: RecipientEnvelope[];
  senderId: string;
  senderName: string;
  createdAt: number;
  isPdf?: boolean;
  mimeType?: string;
  filename?: string;
  encryptionAadVersion?: 2;
  recipientManifestHashSha256?: string;
}

export interface DecryptionEventPayload {
  eventId: string;
  documentId: string;
  documentTitle: string;
  documentHashSha256: string;
  packageHashSha256: string;
  recipientId: string;
  recipientName: string;
  recipientPubkeyFingerprint: string;
  sessionId: string;
  watermarkId: string;
  watermarkCommitment: string;
  watermarkSignatureBase64: string;
  timestampEpochMs: number;
  clientMetadata: {
    terminalId: string;
    runtimeSecurity: string;
  };
}

export interface DecryptionEvent extends DecryptionEventPayload {
  signatureAlgorithm: 'ML-DSA-65';
  recipientSignatureBase64: string;
  /** Versioned authenticated watermark metadata carried by the forensic channel. */
  watermarkSignatureAlgorithm?: 'ML-DSA-65';
  blockHeight?: number;
  txHash?: string;
  status: 'MEMPOOL' | 'COMMITTED';
}

export interface WatermarkPayload {
  syncHeader: number; // 0xA55A
  sessionId: string;
  watermarkId: string;
  recipientId: string;
  recipientFingerprint: string;
  timestamp: number;
  eccChecksum: number;
  /** Base64 ML-DSA-65 signature over the watermark context and original document hash. */
  watermarkSignatureBase64?: string;
  /** SHA-256 of the original unwatermarked document, bound by watermark signature. */
  documentHashSha256?: string;
}

export interface ValidatorNode {
  id: string;
  name: string;
  role: string;
  location: string;
  status: 'ONLINE' | 'VALIDATING' | 'SYNCED';
  blocksValidated: number;
  publicVerificationKeyHex: string;
  signatureAlgorithm?: 'Ed25519';
}

export interface LedgerBlock {
  height: number;
  timestamp: number;
  previousHash: string;
  blockHash: string;
  merkleRoot: string;
  transactions: DecryptionEvent[];
  validatorSignatures: Array<{
    validatorId: string;
    validatorName: string;
    signatureHex: string;
    signatureAlgorithm?: 'Ed25519';
  }>;
  stateRoot: string;
}

export interface ForensicAttributionReport {
  reportId: string;
  analyzedAt: number;
  watermarkExtracted: boolean;
  watermarkPayload?: WatermarkPayload;
  matchedEvent?: DecryptionEvent;
  matchedBlock?: LedgerBlock;
  merkleProofValid: boolean;
  pqcSignatureValid: boolean;
  ledgerIntegrityValid: boolean;
  attributedRecipient?: Recipient;
  attributionVerdict:
    | 'CONFIRMED_LEAK_SOURCE'
    | 'TAMPERED_WATERMARK'
    | 'UNREGISTERED_EVENT'
    | 'FAILED_EXTRACTION'
    | 'NO_WATERMARK'
    | 'INVALID_WATERMARK'
    | 'NO_MATCHING_EVENT'
    | 'SIGNATURE_INVALID'
    | 'LEDGER_INVALID'
    | 'EVIDENCE_MISMATCH';
  confidenceScore: number; // 0 to 100
  evidenceChain: Array<{
    step: string;
    description: string;
    status: 'VERIFIED' | 'WARNING' | 'FAILED';
    technicalDetail: string;
  }>;
}

export interface ClassifiedDocument {
  id: string;
  title: string;
  classification: 'TOP SECRET // SCI' | 'SECRET' | 'CONFIDENTIAL';
  caveats: string;
  originatingOffice: string;
  summary: string;
  rawText: string;
  visualPages: string[]; // SVGs / Canvas Data URLs
  createdAt: number;
  // Binary PDF representation
  isPdf?: boolean;
  mimeType?: string; // e.g. 'application/pdf'
  filename?: string;
  fileSizeBytes?: number;
  pdfBytes?: Uint8Array; // In-memory canonical binary buffer
}
