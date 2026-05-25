import jwt from 'jsonwebtoken';

import { randomUUID, randomBytes } from 'node:crypto';
import { findCredentialsByEmail } from "./persistence.js";
import { verifyPassword } from "./hash.js";
import { getCSRFSecret, getJWTSecret } from "./secret-provider.js";
import { createCSRFToken } from "./csrf.js";

class AuthenticationResult {

    success;
    jwt;
    csrfToken;
    failureReason;

    constructor(success, jwt, csrfToken, reason) {
        this.success = success;
        this.jwt = jwt;
        this.csrfToken = csrfToken;
        this.failureReason = reason ?? null;
    }
}

/**
 * Application Module Tutorial:
 *
 * Ein Service führt logik aus. Hier wird also geschaut ob username und passwort mitgeschickt wurden,
 * ob der user existiert und wenn ja, ob sein passwort übereinstimmt.
 *
 * Um daten zu speichern oder zu lesen brauchen wir noch die letzte layer, die persistence layer.
 * */

/**
 * Versucht einen user durch email & passwort zu authentifizieren.
 * */
export async function authenticateUser(email, password) {

    // TODO login attempt tracking + delay

    if (typeof email !== 'string') {
        return new AuthenticationResult(false, null, 'Email missing or blank');
    }

    if (typeof password !== 'string') {
        return new AuthenticationResult(false, null, 'Password missing or blank');
    }

    const credentials = await findCredentialsByEmail(email);

    if (!credentials) {
        return new AuthenticationResult(false, null, 'User not found');
    }

    if (!await verifyPassword(password, credentials.passwordHash)) {
        return new AuthenticationResult(false, null, 'User and password do not match');
    }

    const secret = getJWTSecret();

    const options = {
        algorithm: 'HS256',
        expiresIn: 60 * 60 * 24,
        jwtid: randomUUID()
    }

    const body = {
        sub: credentials.id,
        name: credentials.name,
        role: credentials.role
    };

    const authToken = jwt.sign(body, secret, options);
    const csrfToken = createCSRFToken(
        getCSRFSecret(),
        jwt.decode(authToken).jti,
        randomBytes(32).toString('base64url')
    );

    return new AuthenticationResult(true, authToken, csrfToken);
}