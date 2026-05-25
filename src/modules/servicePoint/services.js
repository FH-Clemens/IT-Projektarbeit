import { 
    createServicePoint, 
    findAllServicePoints, 
    findServicePointById, 
    updateServicePoint, 
    deleteServicePoint 
} from './persistence.js';

// Fkt für Services je Operation 

// Service CREATE: Legt neuen Servicepunkt an 

export async function registerServicePoint(name) {
    if (typeof name !== 'string' || name.trim().length === 0) {
        throw new Error('Failed to register service point: name must be a non-blank string');
    }
    return await createServicePoint(name.trim(), 'closed');
}

// Service READ ALL: Gibt eine Liste aller Servicepunkte zurück
export async function getAllServicePoints() {
    return await findAllServicePoints();
}

// Service READ ONE: Holt einen einzelnen Servicepunkt
export async function getServicePoint(id) {
    const servicePoint = await findServicePointById(Number(id));
    if (!servicePoint) {
        throw new Error(`Service point with id ${id} not found`);
    }
    return servicePoint;
}

// Service UPDATE: Ändert Status eines Schalters &&/|| die aktuelle Ticketnummer

export async function updateStatus(id, newStatus) {
    const allowedStatuses = ['open', 'closed', 'break'];
    if (!allowedStatuses.includes(newStatus)) {
        throw new Error(`Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`);
    }

    const servicePoint = await getServicePoint(id);
    return await updateServicePoint(servicePoint.id, newStatus, servicePoint.currentNumber);
}

// Service UPDATE: Weist dem Schalter eine Ticketnummer aus der Warteschlange zu 

export async function callTicketNumber(id, ticketNumber) {
    const servicePoint = await getServicePoint(id);
    if (!Number.isInteger(Number(ticketNumber))) {
        throw new Error('Ticket number must be an integer');
    }
    // Setzt Status auf 'open', wenn eine Nummer aufgerufen wird
    return await updateServicePoint(servicePoint.id, 'open', Number(ticketNumber));
}

// Service DELETE: Entfernt einen Servicepunkt komplett aus System

export async function removeServicePoint(id) {
    // Überprüft vorher, ob Entität überhaupt existiert
    await getServicePoint(id); 
    return await deleteServicePoint(id);
}