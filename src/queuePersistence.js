import fs from 'fs';
import * as fsasync from 'fs/promises';
import path from 'path';

function saveQueue(queue){
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const folderName = `${year}${month}${day}`;
    const fileName = `${hours}${minutes}${seconds}.json`;

    const folderPath = path.join(__DATA_DIR__, folderName);
    const filePath = path.join(folderPath, fileName);

    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, {recursive: true})
    }

    fs.writeFileSync(filePath, JSON.stringify(queue, null, 2));
}

/**
* Löscht alte Daten aus der 'queue-data' directory die älter sind als 'minAgeDays'
* @param minAgeDays Mindestalter an Tagen damit ein Queue Ordner gelöscht werden kann
* */
async function removeStaleQueueData(minAgeDays = 3) {

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - minAgeDays);

    const year = cutoffDate.getFullYear();
    const month = String(cutoffDate.getMonth() + 1).padStart(2, "0");
    const day = String(cutoffDate.getDate()).padStart(2, "0");
    const threshold = `${year}${month}${day}`;

    let didRemove = false;
    const entries = await fsasync.readdir(__DATA_DIR__);

    for (const folderName of entries) {

        if (/^\d{8}$/.test(folderName)) {

            if (folderName < threshold) {
                const fullPath = path.join(__DATA_DIR__, folderName);
                await fsasync.rm(fullPath, { recursive: true, force: true });
                didRemove = true;
                console.log("Deleted:", folderName);
            }
        }
    }

    return didRemove;
}

async function removeStaleDataHook(properties, out){

    out.sequential = true;
    const retainDays = properties["retain-data-days"] || 3;

    console.info(`Removing stale data. Retaining ${retainDays} days...`);

    return removeStaleQueueData(retainDays).then(didRemove => {
        if (didRemove) {
            console.info('Done.');
        } else {
            console.info('Nothing to clean');
        }
    })
}

export {
    saveQueue,
    removeStaleDataHook
}