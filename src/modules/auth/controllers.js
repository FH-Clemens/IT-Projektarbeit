import { authenticateUser } from "./services.js";
import { AuthenticationError, InvalidCredentialsError } from "./exceptions.js";

/**
 * Application Module Tutorial:
 *
 * Ein Controller trennt HTTP (presentation) von Anwendung.
 * Dadurch kann die Anwendung Protokoll unabhängig funktionieren.
 * Hier werden parameter aus dem HTTP body entnommen und dem Authentifizierungsservice übergeben.
 * Auch eine ordentliche HTTP response wird vom Controller zurückgeschickt.
 * */

export async function loginController(req, res, next) {

    const parsed = parseParams(req.body);

    if (!parsed) {
        return res.status(400).json({ error: 'Malformed request. Email and password required' });
    }

    const { email, password } = parsed;

    authenticateUser(email, password)
        .then(token => {
            if (!token) throw new Error('Failed to receive Token from Application');

            res.cookie('auth', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });

            res.status(204).end();
        })
        .catch(error => {
            if (error instanceof InvalidCredentialsError) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            if (error instanceof AuthenticationError) {
                return res.status(401).json({ error: 'Failed to authenticate' });
            }

            next(error);
        })
}

function parseParams(body) {

    if (!body) return null;

    if (!('email' in body && typeof body.email === 'string')) return null;
    if (!('password' in body && typeof body.password === 'string')) return null;

    return { email: body.email, password: body.password };
}