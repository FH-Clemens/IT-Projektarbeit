import {authenticateUser} from "./services.js";
import {CSRF_TOKEN_COOKIE_NAME} from "./constants.js";

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
        return res.status(400).json({error: 'Malformed request. Email and password required'});
    }

    const {email, password} = parsed;

    authenticateUser(email, password)
        .then(result => {

            if (result.success === true && result.jwt) {

                res.cookie('auth', result.jwt, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                });

                res.cookie(CSRF_TOKEN_COOKIE_NAME, result.csrfToken, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    path: '/'
                })

                return res.redirect(303, '/internal/queue/employee.html').end();
            }

            if (result.failureReason) {
                return res.status(401).json({error: result.failureReason});
            }

            res.status(401).end();
        })
        .catch(next);
}

function parseParams(body) {

    if (!body) return null;

    if (!('email' in body && typeof body.email === 'string')) return null;
    if (!('password' in body && typeof body.password === 'string')) return null;

    return {email: body.email, password: body.password};
}

export function logoutController(req, res) {
    // Löscht HTTP-Only Auth-Cookie
    res.clearCookie('auth', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });

    // Löscht CSRF-Cookie 
    res.clearCookie('csrf_token', { path: '/' }); 

    // Sendet "204 No Content" zurück, um anzuzeigen, dass die Abmeldung erfolgreich war
    return res.status(204).end();
}