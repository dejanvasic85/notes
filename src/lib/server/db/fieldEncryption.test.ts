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
});
