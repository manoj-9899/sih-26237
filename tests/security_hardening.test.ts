import './setup.ts';
import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildDocumentAad,
  encryptDocumentContent,
  decryptDocumentContent,
  generateEd25519KeyPair,
  signEd25519,
  verifyEd25519,
  bytesToBase64,
  base64ToBytes,
  generateRecipientPqcKeys,
  signWithMlDsa65,
  canonicalizeJson,
  sha256Hex,
} from '../src/crypto/pqc.ts';
import { embedWatermarkInText, extractWatermarkFromText } from '../src/watermark/engine.ts';

describe('Security hardening regressions', () => {
  it('binds AES-GCM to distribution metadata', async () => {
    const plaintext = new TextEncoder().encode('BOUND-DOCUMENT');
    const aad = buildDocumentAad({
      version: 2,
      documentId: 'DOC-1',
      documentHashSha256: 'a'.repeat(64),
      packageId: 'PKG-1',
      recipientManifestHash: 'b'.repeat(64),
      mimeType: 'text/plain',
    });
    const enc = await encryptDocumentContent(plaintext, aad);
    await assert.doesNotReject(() => decryptDocumentContent(enc.ciphertext, enc.tag, enc.iv, enc.cekRaw, aad));
    const altered = buildDocumentAad({
      version: 2,
      documentId: 'DOC-ATTACK',
      documentHashSha256: 'a'.repeat(64),
      packageId: 'PKG-1',
      recipientManifestHash: 'b'.repeat(64),
      mimeType: 'text/plain',
    });
    await assert.rejects(() => decryptDocumentContent(enc.ciphertext, enc.tag, enc.iv, enc.cekRaw, altered));
  });

  it('uses genuine asymmetric validator signatures', async () => {
    const pair = await generateEd25519KeyPair();
    const message = new TextEncoder().encode('SIH-BLOCK-ATTEST-V2:block-hash');
    const signature = await signEd25519(message, pair.privateKey);
    assert.strictEqual(signature.length, 64);
    assert.strictEqual(await verifyEd25519(signature, message, pair.publicKey), true);
    assert.strictEqual(await verifyEd25519(signature, new TextEncoder().encode('different'), pair.publicKey), false);
    assert.strictEqual(bytesToBase64(signature).length > 0, true);
    assert.strictEqual(base64ToBytes(bytesToBase64(signature)).length, 64);
  });
  it('authenticates a forensic watermark instead of trusting CRC alone', async () => {
    const keys = await generateRecipientPqcKeys();
    const documentHashSha256 = await sha256Hex('forensic-document');
    const payload: any = {
      syncHeader: 0xa55a,
      sessionId: '11111111-2222-3333-4444-555555555555',
      watermarkId: 'WM-11111111',
      recipientId: 'ALICE',
      recipientFingerprint: keys.fingerprint,
      timestamp: 1790611200000,
      eccChecksum: 0,
      documentHashSha256,
    };
    const commitment = await sha256Hex('WM-COMMIT:' + payload.sessionId + ':' + payload.recipientId + ':' + documentHashSha256);
    const auth = canonicalizeJson({
      version: 2,
      sessionId: payload.sessionId,
      watermarkId: payload.watermarkId,
      recipientId: payload.recipientId,
      recipientFingerprint: payload.recipientFingerprint,
      timestampEpochMs: payload.timestamp,
      documentHashSha256,
      watermarkCommitment: commitment,
    });
    payload.watermarkSignatureBase64 = bytesToBase64(signWithMlDsa65(new TextEncoder().encode(auth), keys.dsaSecretKey));
    const extracted = extractWatermarkFromText(embedWatermarkInText('CLASSIFIED DOCUMENT', payload));
    assert.ok(extracted);
    assert.strictEqual(extracted?.documentHashSha256, documentHashSha256);
    assert.strictEqual(extracted?.watermarkSignatureBase64, payload.watermarkSignatureBase64);
    assert.strictEqual(extracted?.recipientFingerprint, keys.fingerprint);
  });

});
