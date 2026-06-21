import fs from 'fs';
import * as fsasync from 'fs/promises';
import path from 'path';

let queue = [];

export function setQueue(newQueue) {
    queue = newQueue;
}

export function getQueueSnapshot() {
    return [...queue];
}

export function saveQueue(){
    const now = new Date();

    const folder = now.toISOString().slice(0,10).replaceAll('-', '');
    const file = now.toISOString().slice(11,19).replaceAll(':', '') + '.json';

    const folderPath = path.join(__QUEUE_DATA_DIR__, folder);
    const filePath = path.join(folderPath, file);

    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, {recursive: true})
    }

    fs.writeFileSync(filePath, JSON.stringify(queue, null, 2));
}

/**
 * Lädt beim Start die neueste gespeicherte Queue-Datei von der Festplatte.
 */
export async function loadQueueFromDisk() {

    if (!fs.existsSync(__QUEUE_DATA_DIR__)) {
        console.info("No queue-data directory found. Starting with empty queue.");
        return;
    }

    const folders = (await fsasync.readdir(__QUEUE_DATA_DIR__))
        .filter(folder => /^\d{8}$/.test(folder))
        .sort();


    if (folders.length === 0) {
        console.info("No queue snapshots found. Starting with empty queue.");
        return;
    }

    const latestFolder = folders.at(-1);


    const files = (await fsasync.readdir(path.join(__QUEUE_DATA_DIR__, latestFolder)))
        .filter(folder => /^\d{6}\.json$/.test(folder))
        .sort();


    if (files.length === 0) {
        console.info("Latest queue-data folder is empty. Starting with empty queue.");
        return;
    }

    const content = await fsasync.readFile(
        path.join(__QUEUE_DATA_DIR__, latestFolder, files.at(-1)),
        'utf8'
    );

    queue = JSON.parse(content);
}

/**
 * Löscht alte Daten aus der 'queue-data' directory die älter sind als 'minAgeDays'
 * @param minAgeDays Mindestalter an Tagen damit ein Queue Ordner gelöscht werden kann
 * */
export async function removeStaleQueueData(minAgeDays = 3) {

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - minAgeDays);

    const year = cutoffDate.getFullYear();
    const month = String(cutoffDate.getMonth() + 1).padStart(2, "0");
    const day = String(cutoffDate.getDate()).padStart(2, "0");
    const threshold = `${year}${month}${day}`;

    let didRemove = false;


    const entries = await fsasync.readdir(__QUEUE_DATA_DIR__);

    for (const folderName of entries) {

        if (/^\d{8}$/.test(folderName)) {

            if (folderName < threshold) {
                const fullPath = path.join(__QUEUE_DATA_DIR__, folderName);

                const stat = await fsasync.lstat(fullPath);

                if (!stat.isDirectory() || stat.isSymbolicLink()) {
                    continue;
                }

                await fsasync.rm(fullPath, { recursive: true, force: true });
                didRemove = true;
                console.log("Deleted:", folderName);
            }
        }
    }

    return didRemove;
}