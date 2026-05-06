import db from '../../db.js';
import ROLES from "./roles.js";

const ROLES_ARRAY = Object.values(ROLES);

const QUERY = `
    SELECT * FROM employees
    WHERE
        email = ?
    LIMIT 1;
`

/**
 * Application Module Tutorial:
 *
 * Die Persistence Layer, hier durch ein Repository implementiert, trennt die Anwendung von dauerhaft
 * gespeicherten daten. Das Repository sollte ein interface sein, wobei die art der Speicherung egal ist.
 * */
export async function findCredentialsByEmail(email) {

    return db.get(QUERY, email)
        .then(parseUserCredentialsRow)
        .catch(error => {

            if (error instanceof TypeError) {
                console.warn(`Caught type error for employee query 'email=${email}': `, error);
                return null;
            }

            if (error instanceof SQLError) {
                console.warn('Caught SQL exception: ', error);
                return null;
            }

            throw error;
        });
}

class UserCredentials {

    constructor(id, name, passwordHash, role) {

        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError('id must be positive integer');
        }

        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('name must be non blank string');
        }

        if (typeof passwordHash !== 'string' || passwordHash.length < 32) {
            throw new TypeError('passwordHash must be a valid hash string');
        }

        if (!ROLES_ARRAY.includes(role)) {
            throw new TypeError(`invalid role, must be one of: [${ROLES_ARRAY.join(', ')}]`);
        }

        this.id = id;
        this.name = name;
        this.role = role;
        this.passwordHash = passwordHash;
    }
}

function parseUserCredentialsRow(row) {

    if (!row) return null;

    if (!("id" in row && typeof row.id === 'number')) return null;
    if (!("name" in row && typeof row.name === 'string')) return null;
    if (!("password_hash" in row && typeof row.password_hash === 'string')) return null;
    if (!("role" in row && typeof row.role === 'string')) return null;

    return new UserCredentials(row.id, row.name, row.password_hash, row.role);
}