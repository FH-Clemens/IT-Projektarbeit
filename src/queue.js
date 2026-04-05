import { saveQueue } from "./queuePersistence.js";

let queue = [];

function addToQueue() {
    const nextNumber = queue.length +1;

    const entry = {
        queueNumber: nextNumber,
        createdAt: new Date()
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

export {
    addToQueue,
    getQueue,
    setQueue
}