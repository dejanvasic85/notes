import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { PrismaClient } from '@/generated/prisma/client';
import { encrypt, decrypt } from './encryption';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const basePrisma = new PrismaClient({ adapter });

const prisma = basePrisma.$extends({
	name: 'fieldEncryption',
	query: {
		note: {
			async create({ args, query }) {
				if (args.data.text) {
					args.data.text = encrypt(args.data.text);
				}
				if (args.data.textPlain) {
					args.data.textPlain = encrypt(args.data.textPlain);
				}
				const result = await query(args);
				if (result.text) {
					result.text = decrypt(result.text);
				}
				if (result.textPlain) {
					result.textPlain = decrypt(result.textPlain);
				}
				return result;
			},
			async update({ args, query }) {
				if (args.data.text && typeof args.data.text === 'string') {
					args.data.text = encrypt(args.data.text);
				}
				if (args.data.textPlain && typeof args.data.textPlain === 'string') {
					args.data.textPlain = encrypt(args.data.textPlain);
				}
				const result = await query(args);
				if (result.text) {
					result.text = decrypt(result.text);
				}
				if (result.textPlain) {
					result.textPlain = decrypt(result.textPlain);
				}
				return result;
			},
			async findFirst({ args, query }) {
				const result = await query(args);
				if (result?.text) {
					result.text = decrypt(result.text);
				}
				if (result?.textPlain) {
					result.textPlain = decrypt(result.textPlain);
				}
				return result;
			},
			async findUnique({ args, query }) {
				const result = await query(args);
				if (result?.text) {
					result.text = decrypt(result.text);
				}
				if (result?.textPlain) {
					result.textPlain = decrypt(result.textPlain);
				}
				return result;
			},
			async findMany({ args, query }) {
				const results = await query(args);
				return results.map((result) => {
					if (result.text) {
						result.text = decrypt(result.text);
					}
					if (result.textPlain) {
						result.textPlain = decrypt(result.textPlain);
					}
					return result;
				});
			}
		}
	}
});

export default prisma;
