import { PrismaClient } from '@prisma/client';
import { fieldEncryptionExtension } from 'prisma-field-encryption';

console.log('PRISMA_FIELD_ENCRYPTION_KEY', process.env.PRISMA_FIELD_ENCRYPTION_KEY);
const prisma = new PrismaClient().$extends(fieldEncryptionExtension());

export default prisma;
