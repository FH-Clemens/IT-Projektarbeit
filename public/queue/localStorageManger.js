const STORAGE_KEY = "myQueueEntry";
const EXPIRATION_MS = 5 * 1000;

export function saveQueueEntry(queueNumber) {
    const entry = {
        queueNumber,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function getValidEntry() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsedEntry = JSON.parse(stored);
    const createdAt = new Date(parsedEntry.createdAt);
    if (Date.now() - createdAt > EXPIRATION_MS) {
        clearEntry();
        return null;
    }
    return parsedEntry;
}

export function clearEntry() {
    localStorage.removeItem(STORAGE_KEY);
}