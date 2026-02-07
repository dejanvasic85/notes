import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '@/generated/prisma/client';
import { encrypt, decrypt } from './encryption';

function decryptNoteResult<T extends { text?: string | null; textPlain?: string | null }>(
	result: T
): T {
	return {
		...result,
		...(result.text ? { text: decrypt(result.text) } : {}),
		...(result.textPlain ? { textPlain: decrypt(result.textPlain) } : {})
	};
}

function getPool(connectionString: string) {
	const globalForPg = globalThis as unknown as { __pgPool?: pg.Pool };
	if (!globalForPg.__pgPool) {
		globalForPg.__pgPool = new pg.Pool({ connectionString });
	}
	return globalForPg.__pgPool;
}

function createExtendedClient() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}
	const pool = getPool(connectionString);
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
				async upsert({ args, query }) {
					if (typeof args.create.text === 'string') {
						args.create.text = encrypt(args.create.text);
					}
					if (typeof args.create.textPlain === 'string') {
						args.create.textPlain = encrypt(args.create.textPlain);
					}
					if (typeof args.update.text === 'string') {
						args.update.text = encrypt(args.update.text);
					}
					if (typeof args.update.textPlain === 'string') {
						args.update.textPlain = encrypt(args.update.textPlain);
					}
					const result = await query(args);
					return decryptNoteResult(result);
				},
				async updateMany({ args, query }) {
					const { data } = args;
					if (typeof data.text === 'string') {
						data.text = encrypt(data.text);
					}
					if (typeof data.textPlain === 'string') {
						data.textPlain = encrypt(data.textPlain);
					}
					return query(args);
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
