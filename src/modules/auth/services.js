import jwt from 'jsonwebtoken';

import { randomUUID } from 'node:crypto';
import {findCredentialsByEmail} from "./persistence.js";
import {verifyPassword} from "./hash.js";
import {getJWTSecret} from "./secret-provider.js";

class AuthenticationResult {

    success;
    token;
    reason;

    constructor(success, token, reason) {
        this.success = success;
        this.token = token;
        this.reason = reason ?? null;
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

    const token = jwt.sign(body, secret, options);

    return new AuthenticationResult(true, token);
}