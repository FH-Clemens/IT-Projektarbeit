import jwt from "jsonwebtoken";
import {getCSRFSecret, getJWTSecret} from "./secret-provider.js";

import { validateCSRFToken } from "./csrf.js";
import {CSRF_TOKEN_HEADER_NAME} from "./constants.js";

export function tokenParser() {

    return (req, res, next) => {

        const token = req.cookies.auth
        if (!token) return next();

        try {
            req.jwt = jwt.verify(token, getJWTSecret());
        } catch {
            return res.status(401).json({ error: 'Invalid signature' });
        }

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

export function csrfProtection(req, res, next) {

    if (req.method === 'GET') {
        return next()
    }

    const csrfToken = req.header(CSRF_TOKEN_HEADER_NAME);

    if (!csrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    if (!validateCSRFToken(getCSRFSecret(), csrfToken, req.jwt.jti)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
}