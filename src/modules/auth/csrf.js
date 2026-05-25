import {createHmac, timingSafeEqual} from "node:crypto";

const ALGORITHM = 'sha256';

// Token format <hmac>.<rand>
// HMAC enthält: <sessionid.length>!<sessionId>!<random.length>!<random> die sessionId ist die JWTID

function buildMessage(jwtId, rand) {
    return `${jwtId.length}!${jwtId}!${rand.length}!${rand}`;
}

export function createCSRFToken(secret, jwtId, rand) {

    if (typeof jwtId !== 'string' || jwtId.trim().length === 0) {
        throw new Error('Error generating CSRF token: JWTID null or blank');
    }

    const message = buildMessage(jwtId, rand);
    const hmac = createHmac(ALGORITHM, secret)
        .update(message)
        .digest('hex');

    return `${hmac}.${rand}`
}

/*
* Validiert einen CSRF HTTP Header token.
* https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#pseudo-code-for-implementing-hmac-csrf-tokens
* **/
export function validateCSRFToken(secret, headerToken, jwtId) {

    if (typeof jwtId !== 'string' || jwtId.trim().length === 0) {
        throw new Error('Failed to validate CSRF Token: jwtId null or blank');
    }

    if (typeof headerToken !== 'string' || headerToken.trim().length === 0) {
        throw new Error('Failed to validate CSRF Token: headerToken null or blank');
    }

    const tokenParts = headerToken.split('.');
    const hmacFromRequest = tokenParts[0];
    const randomFromRequest = tokenParts[1];

    if (!hmacFromRequest || !randomFromRequest) return false;

    const message = buildMessage(jwtId, randomFromRequest);

    const expectedHMACBuf = createHmac(ALGORITHM, secret)
        .update(message)
        .digest();

    const hmacRequestBuf = Uint8Array.from(Buffer.from(hmacFromRequest, 'hex'));

    if (!timingSafeEqual(expectedHMACBuf, hmacRequestBuf)) {
        console.error('Invalid CSRF token', hmacFromRequest)
        return false;
    }

    return true;
}