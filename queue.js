import { saveQueue } from "./queuePersistence.js";

let queue = [];

function addToQueue() {
    const nextNumber = queue.length +1;

    const entry = {
        queueNumber: nextNumber,
        createdAt: new Date(),
        status: "waiting"
    };

    queue.push(entry);

    saveQueue(queue);
    return entry;
}

function getQueue() {
    return queue;
}

function setQueue(newQueue) {
    queue = newQueue;
}

function updateStatus(number, newStatus) {
    const entry = queue.find(item => item.queueNumber === parseInt(number));
    if (entry) {
        entry.status = newStatus;
        saveQueue(queue);
        return true;
    }
    return false;
}

export {
    addToQueue,
    getQueue,
    setQueue,
    updateStatus
}