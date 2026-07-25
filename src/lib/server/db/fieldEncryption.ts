import { encryptString, decryptString } from '@47ng/cloak';

import { PRISMA_FIELD_ENCRYPTION_KEY } from '$env/static/private';

export const encryptField = (plaintext: string): Promise<string> =>
	encryptString(plaintext, PRISMA_FIELD_ENCRYPTION_KEY);

export const decryptField = (ciphertext: string): Promise<string> =>
	decryptString(ciphertext, PRISMA_FIELD_ENCRYPTION_KEY);
