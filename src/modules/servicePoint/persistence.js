import db from '../../db.js';

// Domain Entity für ServicePoint 

export class ServicePoint {
    constructor(id, name, status, currentNumber = null) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError('id must be a positive integer');
        }
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new TypeError('name must be a non-blank string');
        }
        if (typeof status !== 'string' || status.trim().length === 0) {
            throw new TypeError('status must be a non-blank string');
        }

        this.id = id;
        this.name = name;
        this.status = status;
        this.currentNumber = currentNumber;
    }
}

// Fkt zum Parsen der SQL-Tabellenzeilen in echte ServicePoint-Entities

function parseServicePointRow(row) {
    if (!row) return null;

    if (!("id" in row && typeof row.id === 'number')) return null;
    if (!("name" in row && typeof row.name === 'string')) return null;
    if (!("status" in row && typeof row.status === 'string')) return null;

    return new ServicePoint(row.id, row.name, row.status, row.current_number);
}

// Persistence Store für alle CRUD Operationen 

export async function createServicePoint(name, status = 'closed') { // CREATE
    const query = `INSERT INTO service_points (name, status) VALUES (?, ?);`;
    return db.run(query, [name, status])
        .then(result => new ServicePoint(result.lastID, name, status, null))
        .catch(error => {
            console.error('Error in SQL insert for service point:', error);
            throw error;
        });
}

export async function findAllServicePoints() {  // READ ALL
    const query = `SELECT * FROM service_points;`;
    return db.all(query)
        .then(rows => rows.map(parseServicePointRow).filter(Boolean))
        .catch(error => {
            console.error('Error in SQL select all service points:', error);
            throw error;
        });
}

export async function findServicePointById(id) {    // READ ONE
    const query = `SELECT * FROM service_points WHERE id = ? LIMIT 1;`;
    return db.get(query, [id])
        .then(parseServicePointRow)
        .catch(error => {
            console.error(`Error in SQL select for service point id=${id}:`, error);
            throw error;
        });
}

export async function updateServicePoint(id, status, currentNumber = null) {   // UPDATE
    const query = `UPDATE service_points SET status = ?, current_number = ? WHERE id = ?;`;
    return db.run(query, [status, currentNumber, id])
        .then(async (result) => {
            if (result.changes === 0) return null;
            return findServicePointById(id);
        })
        .catch(error => {
            console.error(`Error in SQL update for service point id=${id}:`, error);
            throw error;
        });
}

export async function deleteServicePoint(id) {  // DELETE
    const query = `DELETE FROM service_points WHERE id = ?;`;
    return db.run(query, [id])
        .then(result => result.changes > 0)
        .catch(error => {
            console.error(`Error in SQL delete for service point id=${id}:`, error);
            throw error;
        });
}