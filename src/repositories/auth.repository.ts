import { prisma } from '../config/db.config.js';
import type { DBClient } from '../types/db.types.js';

export const findUserByEmail = async (email: string, client: DBClient = prisma) => {
    return await client.user_local_account.findUnique({
        where: { email: email }
    });
}

export const createUserLocalAccount = async (email: string, passwordHash: string, userId: number, client: DBClient = prisma) => {
    return await client.user_local_account.create({
        data: {
            email: email,
            password_hash: passwordHash,
            user_id: userId
        }
    });
}

export const createUser = async (username: string, phone_num: string, region_id: number, client: DBClient = prisma) => {
    return await client.user.create({
        data: {
            username: username,
            phone_num: phone_num,
            region_id: region_id
        }
    });
};

