import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	earlyAccess: true,
	schema: path.join(__dirname, 'prisma', 'schema.prisma'),
	migrate: {
		async adapter() {
			const { PrismaPg } = await import('@prisma/adapter-pg');
			const pg = await import('pg');
			const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
			return new PrismaPg(pool);
		}
	}
});
