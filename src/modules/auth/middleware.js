import jwt from "jsonwebtoken";
import {getCSRFSecret, getJWTSecret} from "./secret-provider.js";

import { validateCSRFToken } from "./csrf.js";

const CSRF_TOKEN_HEADER = 'X-CSRF-Token';

export function tokenParser() {

    return (req, res, next) => {

        const csrfToken = req.header(CSRF_TOKEN_HEADER);
        const auth = req.cookies.auth

        // TODO create guest jwt
        if (!auth) return next();

        const jsonWebtoken = jwt.verify(auth, getJWTSecret());
        const jti = jsonWebtoken.jti;

        if (!validateCSRFToken(getCSRFSecret(), csrfToken, jti)) {
            return req.status(403).json({ error: 'Invalid CSRF token' });
        }

        req.jwt = jsonWebtoken;

        next();
    }
}


export default function requireRole(...allowedRoles) {

    if (allowedRoles.length < 1) {
        throw new Error('Must provide at least 1 role');
    }

    return (req, res, next) => {

        if (!req.jwt) {
            return res.status(401).json({ error: 'Not Authenticated' });
        }

        if (!allowedRoles.includes(req.jwt.role)) {
            return res.status(403).json({ error: 'Not Authorized' });
        }

        next();
    }
}