const fs = require('fs');
const path = require('path');

let queue = [];

function saveQueue(){
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDay()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const folderName = `${year}${month}${day}`;
    const fileName = `${hours}${minutes}${seconds}.json`;
    
    const folderPath = path.join(__dirname, 'queue-data', folderName);
    const filePath = path.join(folderPath, fileName);
    
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, {recursive: true})
    }

    fs.writeFileSync(filePath, JSON.stringify(queue, null, 2));
}


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

module.exports = {
    addToQueue,
    getQueue
};