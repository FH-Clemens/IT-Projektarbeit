
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';

const ALGORITHM = 'scrypt';
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const SCRYPT_PARAMS = {
    N: 16384,
    r: 8,
    p: 1,
};

export async function hashPassword(password) {
    return new Promise((resolve, reject) => {

        const salt = randomBytes(SALT_LENGTH);

        scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(`$${ALGORITHM}$${salt.toString('hex')}$${derivedKey.toString('hex')}`);
        });
    })
}

export async function verifyPassword(password, storedHash) {
    return new Promise((resolve, reject) => {

        const parsed = parseHash(storedHash);
        if (!parsed) resolve(false);

        scrypt(password, parsed.salt, parsed.hash.length, SCRYPT_PARAMS, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(timingSafeEqual(derivedKey, parsed.hash));
        });
    })
}

function parseHash(storedHash) {

    const parts = storedHash.split('$');

    if (parts.length !== 4 || parts[0] !== '' || parts[1] !== ALGORITHM) {
        return null;
    }

    return {
        salt: Buffer.from(parts[2], 'hex'),
        hash: Buffer.from(parts[3], 'hex')
    }
}