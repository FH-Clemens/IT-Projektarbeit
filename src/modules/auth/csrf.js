
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import {getCSRFSecret} from "./secret-provider.js";

const ALGORITHM = 'sha256';
const CSRF_VALID_MILLIS = Number(process.env.CSRF_VALID_SECONDS) * 1000;
const RAND_LEN = Number(process.env.CSRF_LENGTH_BYTES);

// TODO throw error if no rand len
// TODO throw error if secret is too short

// Token format <rand>.<issuedAt>.<hmac>
// HMAC enthält: <rand>.<issuedAt>.<uid> die User id muss vom JWT entnommen werden

function buildMessage(rand, issuedAt, uid) {
    return `${rand}.${issuedAt}.${uid}`;
}

function parseToken(token) {
    const parts = token.split('.');

    if (parts.length !== 3 || parts.any(p => p.length === 0)) {
        return null;
    }

    return {
        rand: parts[0],
        issuedAtString: parts[1],
        digestString: parts[2]
    }
}

function generateCSRFTokenPure(rand, uid, issuedAt, secret) {

    const hmac = createHmac(ALGORITHM, secret)
        .update(buildMessage(rand, issuedAt, uid))
        .digest('hex');

    return `${rand}.${issuedAt}.${hmac}`;
}

export function createCSRFToken(uid) {
    if (!uid || typeof uid !== 'number' || uid < 0) throw new Error(`Error generating CSRF token: invalid UID: ${uid} `);

    const secret = getCSRFSecret();
    const rand = randomBytes(RAND_LEN).toString('base64url');
    const issuedAt = Date.now();

    return generateCSRFTokenPure(rand, uid, issuedAt, secret);
}

function isExpired(issuedAtString) {

    if (typeof issuedAtString !== 'string' || issuedAtString.trim().length === 0) {
        throw new Error('Failed to validate CSRF Token: malformed token');
    }

    const issuedAtMillis = Number(issuedAtString);

    if (!Number.isFinite(issuedAtMillis)) return true;
    if (!Number.isInteger(issuedAtMillis)) return true;
    if (issuedAtMillis < 0) return true;

    const nowMillis = Date.now();

    if (issuedAtMillis > nowMillis) {
        console.warn('Tried CSRF validation with future issued timestamp');
        return true;
    }

    return (nowMillis - issuedAtMillis) > CSRF_VALID_MILLIS;
}

/*
* Um den CSRF Token zu authentifizieren verwenden wir HMAC mit sha256. Der provided digest MUSS der HTTP Header token sein
* **/
function isAuthenticMessage(rand, issuedAt, uid, secret, providedDigestHex) {

    // Comparison wird als raw bytes gemacht, nicht hex
    const actualDigestBytes = createHmac(ALGORITHM, secret)
        .update(buildMessage(rand, issuedAt, uid))
        .digest();

    let providedDigestBytes;

    try {
        providedDigestBytes = Buffer.from(providedDigestHex, 'hex');
    } catch {
        return false;
    }

    if (actualDigestBytes.length !==  providedDigestBytes.length) return false;

    return timingSafeEqual(actualDigestBytes, providedDigestBytes);
}

export function validateCSRFToken(cookieToken, headerToken, uid) {

    if (typeof cookieToken !== 'string' || cookieToken.trim().length === 0) {
        throw new Error('Failed to validate CSRF Token: cookieToken null or blank');
    }

    if (typeof headerToken !== 'string' || headerToken.trim().length === 0) {
        throw new Error('Failed to validate CSRF Token: headerToken null or blank');
    }

    if (typeof uid !== 'number' || uid < 0) {
        throw new Error('Failed to validate CSRF Token: uid null or negative');
    }

    const { rand, issuedAtString, digestString } = parseToken(headerToken);

    if (isExpired(issuedAtString)) {
        return false;
    }

    const secret = getCSRFSecret();
    const { rand: cookieRand } = parseToken(cookieToken);

    const buff0 = Buffer.from(cookieRand);
    const buff1 = Buffer.from(rand);

    if (buff0.length !== buff1.length) return false;

    return timingSafeEqual(buff0, buff1) && isAuthenticMessage(rand, issuedAtString, uid, secret, digestString);
}