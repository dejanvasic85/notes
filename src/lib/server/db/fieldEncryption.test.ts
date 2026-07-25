import { describe, it, expect } from 'vitest';

import { encryptField, decryptField } from './fieldEncryption';

describe('encryptField / decryptField', () => {
	it('round-trips a plaintext string', async () => {
		const plaintext = 'a secret note';

		const ciphertext = await encryptField(plaintext);

		expect(ciphertext).not.toBe(plaintext);
		expect(ciphertext).toMatch(/^v1\.aesgcm256\./);
		expect(await decryptField(ciphertext)).toBe(plaintext);
	});

	it('produces a different ciphertext each time due to the random IV', async () => {
		const plaintext = 'a secret note';

		const [first, second] = await Promise.all([encryptField(plaintext), encryptField(plaintext)]);

		expect(first).not.toBe(second);
	});

	it('decrypts a ciphertext produced independently of the current encryptField call site', async () => {
		// Fixed fixture, encrypted ahead of time with the same key/algorithm the retired
		// prisma-field-encryption plugin used (AES-GCM via @47ng/cloak), to guard against
		// regressions that would make previously-written data unreadable.
		const legacyCiphertext =
			'v1.aesgcm256.42b02640.fiJd1H9NnQdYSP8W.sTcXqP4VBYJkv0pQ-rbDVMuJs6yn67K_GUf5X0GZCrZAjDpASA==';

		expect(await decryptField(legacyCiphertext)).toBe('legacy plaintext note');
	});
});
