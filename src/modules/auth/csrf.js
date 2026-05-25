
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { getCSRFSecret } from "./secret-provider.js";

const ALGORITHM = 'sha256';
const CSRF_VALID_MILLIS = Number(process.env.CSRF_VALID_SECONDS) * 1000;
const RAND_LEN = Number(process.env.CSRF_LENGTH_BYTES);

// TODO throw error if no rand len
// TODO throw error if secret is too short

// Token format <rand>.<issuedAt>.<hmac>
// HMAC enthält: <rand>.<issuedAt>.<uid> die User id muss vom JWT entnommen werden

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

function buildMessage(rand, issuedAt, uid) {
    return `${rand}.${issuedAt}.${uid}`;
}

function generateMessageDigest(randBase64, uid, issuedAtString, secretBytes) {
    return createHmac(ALGORITHM, secretBytes)
        .update(buildMessage(randBase64, issuedAtString, uid))
        .digest('hex');
}

export function createCSRFToken(uid) {
    if (!uid || typeof uid !== 'number' || uid < 0) throw new Error(`Error generating CSRF token: invalid UID: ${uid} `);

    const secret = getCSRFSecret();
    const issuedAt = String(Date.now());
    const rand = randomBytes(RAND_LEN).toString('base64url');

    return `${rand}.${issuedAt}.${generateMessageDigest(rand, uid, issuedAt, secret)}`;
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
function isAuthenticMessage(rand, issuedAtString, uid, secret, providedDigestHex) {

    const computedDigestBytes = createHmac(ALGORITHM, secret)
        .update(buildMessage(rand, issuedAtString, uid))
        .digest();

    let providedDigestBytes;

    try {
        providedDigestBytes = Buffer.from(providedDigestHex, 'hex');
    } catch {
        return false;
    }

    if (computedDigestBytes.length !==  providedDigestBytes.length) return false;

    return timingSafeEqual(computedDigestBytes, providedDigestBytes);
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

    const headerTokenParsed = parseToken(headerToken);

    if (!headerTokenParsed) {
        console.warn('Failed to validate CSRF Token: HTTP Header token malformed');
        return false;
    }

    const cookieTokenParsed = parseToken(cookieToken);

    if (!cookieTokenParsed) {
        console.warn('Failed to validate CSRF Token: Cookie token malformed');
        return false;
    }

    if (isExpired(headerTokenParsed.issuedAtString)) {
        return false;
    }

    const secret = getCSRFSecret();

    const buff0 = Buffer.from(cookieTokenParsed.rand);
    const buff1 = Buffer.from(headerTokenParsed.rand);

    if (buff0.length !== buff1.length) return false;

    return timingSafeEqual(buff0, buff1) &&
        isAuthenticMessage(headerTokenParsed.rand, headerTokenParsed.issuedAtString, uid, secret, headerTokenParsed.digestString);
}