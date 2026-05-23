
const jwtSecret = process.env.JWT_SECRET;

export function getJWTSecret() {
    return jwtSecret;
}

const csrfSecret = process.env.CSRF_SECRET;

export function getCSRFSecret() {
    return csrfSecret;
}