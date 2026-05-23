import jwt from "jsonwebtoken";
import {getJWTSecret} from "./secret-provider.js";

export function tokenParser(req, res, next) {

    const token = req.cookies
    if (!token) return next();

    try {
        const payload = jwt.verify(token, getJWTSecret());
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