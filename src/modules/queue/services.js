import { getQueueSnapshot, setQueue, saveQueue} from "./persistence.js";
import { QUEUE_STATUS} from "./constants.js";

export function enterQueue() {

    const queue = getQueueSnapshot();
    const nextNumber = queue.length + 1;
    const servicePoint = null;

    const entry = {
        queueNumber: nextNumber,
        createdAt: new Date(),
        status: QUEUE_STATUS.WAITING,
        servicePoint: servicePoint ?? "default"
    };

    queue.push(entry);
    setQueue(queue);
    saveQueue();

    return entry;
}

export function getQueue() {
    return getQueueSnapshot();
}

export function updateQueueStatus(queueNumber, status, servicePoint) {

    const queue = getQueueSnapshot();
    const entry = queue.find(q => q.queueNumber === Number(queueNumber));
    if(!entry) return false;

    entry.status = status;

    if(servicePoint) {
        entry.servicePoint = servicePoint;
    }
    setQueue(queue);
    saveQueue();

    return true;
}