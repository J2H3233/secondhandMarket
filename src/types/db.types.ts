import { PrismaClient, Prisma } from '@prisma/client';

export type DBClient = PrismaClient | Prisma.TransactionClient;

