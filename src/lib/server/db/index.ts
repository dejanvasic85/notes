import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '@/generated/prisma/client';
import { encrypt, decrypt } from './encryption';

function decryptNoteResult<T extends { text?: string | null; textPlain?: string | null }>(
	result: T
): T {
	if (result.text) {
		result.text = decrypt(result.text);
	}
	if (result.textPlain) {
		result.textPlain = decrypt(result.textPlain);
	}
	return result;
}

function createExtendedClient() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}
	const pool = new pg.Pool({ connectionString });
	const adapter = new PrismaPg(pool);
	const basePrisma = new PrismaClient({ adapter });

	return basePrisma.$extends({
		name: 'fieldEncryption',
		query: {
			note: {
				async create({ args, query }) {
					if (typeof args.data.text === 'string') {
						args.data.text = encrypt(args.data.text);
					}
					if (typeof args.data.textPlain === 'string') {
						args.data.textPlain = encrypt(args.data.textPlain);
					}
					const result = await query(args);
					return decryptNoteResult(result);
				},
				async update({ args, query }) {
					const { data } = args;
					if (typeof data.text === 'string') {
						data.text = encrypt(data.text);
					}
					if (typeof data.textPlain === 'string') {
						data.textPlain = encrypt(data.textPlain);
					}
					const result = await query(args);
					return decryptNoteResult(result);
				},
				async findFirst({ args, query }) {
					const result = await query(args);
					return result ? decryptNoteResult(result) : result;
				},
				async findFirstOrThrow({ args, query }) {
					const result = await query(args);
					return decryptNoteResult(result);
				},
				async findUnique({ args, query }) {
					const result = await query(args);
					return result ? decryptNoteResult(result) : result;
				},
				async findMany({ args, query }) {
					const results = await query(args);
					return results.map(decryptNoteResult);
				}
			}
		}
	});
}

let prisma: ReturnType<typeof createExtendedClient>;

function getClient() {
	if (!prisma) {
		prisma = createExtendedClient();
	}
	return prisma;
}

export default new Proxy({} as ReturnType<typeof createExtendedClient>, {
	get(_, prop) {
		return getClient()[prop as keyof typeof prisma];
	}
});
