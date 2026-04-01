import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'node:fs/promises';

import StartupManager from "./src/startup.js";
import { addToQueue, getQueue } from './src/queue.js';
import * as fs from 'fs/promises';



const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url);
global.__APP_DIR__ = path.dirname(__filename);

app.use(express.static('public'));

app.get("/api/queue/enter", (req, res) => {
    try {
        const entry = addToQueue();
        res.status(200);
        res.send(entry);
    } catch (e) {
        console.error(e);
        res.status(500);
        res.send();
    }
})

app.get("/api/queue/get-queue", (req, res) => {
    try {
        res.status(200);
        res.send({"queue": getQueue()});
    } catch (e) {
        console.error(e);
        res.status(500);
        res.send();
    }
})

async function start() {

    let config = null;

    try {
        const configPath = __APP_DIR__ + "/config.json";
        const response = await readFile(configPath, 'utf-8');

        config = JSON.parse(response);
    } catch (e) {
        console.error('Error reading config file: ', e);
    }
    const startupManager = new StartupManager();
    startupManager.addHook(async (properties, out) => {
        try {
            const retainDays = properties["retain-data-days"] || 3;
            const queueDataPath = path.join(__APP_DIR__, "queue-data");

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retainDays);

            const year = cutoffDate.getFullYear();
            const month = String(cutoffDate.getMonth() + 1).padStart(2, "0");
            const day = String(cutoffDate.getDate()).padStart(2, "0");
            const threshold = `${year}${month}${day}`;

            const entries = await fs.readdir(queueDataPath);

            for (const folderName of entries) {
                if (/^\d{8}$/.test(folderName)) {
                    if (folderName < threshold) {
                        const fullPath = path.join(queueDataPath, folderName);
                        await fs.rm(fullPath, { recursive: true, force: true });
                        console.log("Deleted:", folderName);
                    }
                }
            }

            out.sequential = true;

        } catch (e) {
            console.error(e);
        }
    });

    console.log('Starting server...');

    await startupManager.run(config);



    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

await start();