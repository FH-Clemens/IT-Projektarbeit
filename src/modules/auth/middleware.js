import jwt from "jsonwebtoken";
import {getJWTSecret} from "./secret-provider.js";

import { createCSRFToken, validateCSRFToken } from "./csrf.js";

export function csrfValidator(req, res, next) {

}

export function tokenParser(req, res, next) {

    const cookies = req.cookies
    if (!cookies) return next();

    try {
        const payload = jwt.verify(cookies.auth, getJWTSecret());
        req.auth = { id: payload.uid, name: payload.name, role: payload.role  };
    } catch {
        req.auth = undefined;
    }

    next();
}

export default function requireRole(...allowedRoles) {

    if (allowedRoles.length < 1) {
        throw new Error('Must provide at least 1 role');
    }

    return (req, res, next) => {

        if (!req.auth) {
            return res.status(401).json({ error: 'Not Authenticated' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Not Authorized' });
        }

        next();
    }
}