import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'node:fs/promises';

import StartupManager from "./src/startup.js";
import { addToQueue, getQueue, updateStatus } from './src/queue.js';
import { loadQueueFromDiskHook, removeStaleDataHook } from "./src/queuePersistence.js";

import {tokenParser} from "./src/modules/auth/middleware.js";

import employeesRoutes from "./employeesRoutes.js";
import authRouter from './src/modules/auth/routes.js';

const __filename = fileURLToPath(import.meta.url);
global.__APP_DIR__ = path.dirname(__filename);
global.__DATA_DIR__ = path.join(__APP_DIR__, "/queue-data");

const port = 3000;
const app = express();

app.use(express.json());
app.use(tokenParser);
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

app.post("/api/queue/update-status", (req, res) => {
    try {
        const { queueNumber, status } = req.body;
        const success = updateStatus(queueNumber, status);
        
        if (success) {
            res.status(200).send({ message: "Status erfolgreich geändert" });
        } else {
            res.status(404).send({ message: "Nummer nicht gefunden" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send();
    }
});

async function start() {

    let config = null;

    try {
        const configPath = __APP_DIR__ + "/config.json";
        const response = await readFile(configPath, 'utf-8');

        config = JSON.parse(response);
    } catch (e) {
        console.error('Error reading config file: ', e);
    }

    app.use("/api/employees", employeesRoutes);

    // TEST
    app.use("/api", authRouter);

    const startupManager = new StartupManager();

    startupManager.addHook(loadQueueFromDiskHook);
    startupManager.addHook(removeStaleDataHook);

    console.log('Starting server...');

    await startupManager.run(config);

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

await start();