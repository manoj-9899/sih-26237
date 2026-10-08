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
} from '../src/crypto/pqc.ts';

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
});
