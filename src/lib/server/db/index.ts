import { PrismaClient } from '@prisma/client';
import { fieldEncryptionExtension } from 'prisma-field-encryption';

const prisma = new PrismaClient().$extends(fieldEncryptionExtension());

export default prisma;
