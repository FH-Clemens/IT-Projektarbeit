import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'node:fs/promises';

import StartupManager from "./src/startup.js";
import { addToQueue, getQueue, updateStatus } from './src/modules/queue/service.js';
import { loadQueueFromDiskHook, removeStaleDataHook } from "./src/modules/queue/persistence.js";

import {tokenParser} from "./src/modules/auth/middleware.js";

import employeesRoutes from "./employeesRoutes.js";
import authRouter from './src/modules/auth/routes.js';
import QueueRouter from "./src/modules/queue/routes.js";

const __filename = fileURLToPath(import.meta.url);
global.__APP_DIR__ = path.dirname(__filename);
global.__DATA_DIR__ = path.join(__APP_DIR__, "/queue-data");

const port = 3000;
const app = express();

app.use(express.json());
app.use(tokenParser);
app.use(express.static('public'));

app.use(QueueRouter);

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