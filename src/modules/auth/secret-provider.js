import StartupManager from '../../startup.js';

export function getJWTSecret() {
    return StartupManager.config.JWT_SECRET;
}

export function getCSRFSecret() {
    return StartupManager.config.CSRF_SECRET;
}