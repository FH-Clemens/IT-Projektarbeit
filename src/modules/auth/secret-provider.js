
const secret = process.env.JWT_SECRET;

export default function getJWTSecret() {
    return secret;
}