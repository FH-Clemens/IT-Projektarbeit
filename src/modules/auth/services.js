import jwt from 'jsonwebtoken';

import {findCredentialsByEmail} from "./persistence.js";
import {AuthenticationError} from "./exceptions.js";
import {verifyPassword} from "./hash.js";
import getJWTSecret from "./secret-provider.js";


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
        throw new AuthenticationError('Failed to authenticate: email must be non blank string');
    }

    if (typeof password !== 'string') {
        throw new AuthenticationError('Failed to authenticate: password must be non blank string')
    }

    const credentials = await findCredentialsByEmail(email);

    if (!credentials) {
        throw new AuthenticationError('User not found');
    }

    if (!await verifyPassword(password, credentials.passwordHash)) {
        throw new AuthenticationError('Invalid Password');
    }

    const secret = getJWTSecret();

    const options = {
        algorithm: 'HS256',
        expiresIn: 60 * 60 * 24
    }

    const body = {
        uid: credentials.id,
        name: credentials.name,
        role: credentials.role
    };

    return new Promise((resolve, reject) => {
        jwt.sign(body, secret, options, (err, token) => {
            if (err) reject(err);
            else resolve(token);
        })
    })
}