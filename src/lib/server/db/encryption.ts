import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const AES_256_KEY_LENGTH = 32;
const KEY_PREFIX = 'k1.aesgcm256.';
const CIPHERTEXT_PREFIX = 'v1.aesgcm256.';

function parseKey(keyString: string): Buffer {
	if (!keyString.startsWith(KEY_PREFIX)) {
		throw new Error(`Invalid key format: expected prefix ${KEY_PREFIX}`);
	}
	const base64Key = keyString.slice(KEY_PREFIX.length);
	const key = Buffer.from(base64Key, 'base64');
	if (key.length !== AES_256_KEY_LENGTH) {
		throw new Error(`Invalid key length: expected ${AES_256_KEY_LENGTH} bytes, got ${key.length}`);
	}
	return key;
}

function getEncryptionKey(): Buffer {
	const keyString = process.env.PRISMA_FIELD_ENCRYPTION_KEY;
	if (!keyString) {
		throw new Error('PRISMA_FIELD_ENCRYPTION_KEY environment variable is not set');
	}
	return parseKey(keyString);
}

export function encrypt(plaintext: string): string {
	const key = getEncryptionKey();
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();

	const combined = Buffer.concat([iv, authTag, encrypted]);
	return CIPHERTEXT_PREFIX + combined.toString('base64');
}

export function decrypt(ciphertext: string): string {
	if (!ciphertext.startsWith(CIPHERTEXT_PREFIX)) {
		// Return as-is if not encrypted (for backwards compatibility or unencrypted data)
		return ciphertext;
	}

	const key = getEncryptionKey();
	const data = Buffer.from(ciphertext.slice(CIPHERTEXT_PREFIX.length), 'base64');

	const iv = data.subarray(0, IV_LENGTH);
	const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
	const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

	const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
	decipher.setAuthTag(authTag);

	return decipher.update(encrypted) + decipher.final('utf8');
}

export function encryptNoteFields<T extends { text?: string; textPlain?: string }>(data: T): T {
	const result = { ...data };
	if (result.text !== undefined) {
		result.text = encrypt(result.text);
	}
	if (result.textPlain !== undefined) {
		result.textPlain = encrypt(result.textPlain);
	}
	return result;
}

export function decryptNoteFields<T extends { text?: string; textPlain?: string }>(data: T): T {
	const result = { ...data };
	if (result.text !== undefined) {
		result.text = decrypt(result.text);
	}
	if (result.textPlain !== undefined) {
		result.textPlain = decrypt(result.textPlain);
	}
	return result;
}
