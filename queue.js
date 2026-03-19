let queue = [];

function addToQueue() {
    const nextNumber = queue.length +1;

    const entry = {
        queueNumber: nextNumber,
        createdAt: new Date()
    };

    queue.push(entry);
    return entry;
}

function getQueue() {
    return queue;
}

module.exports = {
    addToQueue,
    getQueue
};