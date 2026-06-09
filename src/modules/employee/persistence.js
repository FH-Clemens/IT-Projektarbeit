
import db from '../../db.js';

export async function employeeExistsById(id) {
    const query = 'SELECT id FROM employees WHERE id = ?;';
    return db.get(query, id).then(res => typeof res !== 'undefined');
}

export async function createEmployee(name, email, passwordHash, role) {
    const query = `INSERT INTO employees (name, email, password_hash, role) VALUES (?, ?, ?, ?);`;
    return db.run(query, name, email, passwordHash, role)
        .then(result => result.lastID)
}

export async function getEmployeePage(size, offset) {
    const query = 'SELECT id, name, email, role FROM employees LIMIT ? OFFSET ?;';
    return db.all(query, size, offset);
}

export async function findEmployeeById(id) {
    const query = 'SELECT id, name, email, role FROM employees WHERE id = ?;';
    return db.get(query, id);
}

export async function deleteEmployeeById(id) {
    const query = 'DELETE FROM employees WHERE id = ?;';
    return db.run(query, id).then(res => res.changes > 0);
}