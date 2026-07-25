import { PrismaPg } from '@prisma/adapter-pg';

import { DATABASE_URL } from '$env/static/private';

import { PrismaClient } from './generated/client';

const CONNECTION_TIMEOUT_MILLIS = 5_000;

const adapter = new PrismaPg({
	connectionString: DATABASE_URL,
	connectionTimeoutMillis: CONNECTION_TIMEOUT_MILLIS
});
const prisma = new PrismaClient({ adapter });

export default prisma;
