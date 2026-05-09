import express from 'express';
import path from 'path';
import cron from 'node-cron';

import { fileURLToPath } from 'url';
import { readFile } from 'node:fs/promises';

import StartupManager from "./src/startup.js";
import {removeStaleQueueData } from "./src/modules/queue/persistence.js";
import { removeStaleDataHook, loadQueueFromDiskHook } from "./src/modules/queue/startupHooks.js";

import {tokenParser} from "./src/modules/auth/middleware.js";

import employeesRoutes from "./employeesRoutes.js";
import authRouter from './src/modules/auth/routes.js';
import queueRouter from './src/modules/queue/routes.js';

const __filename = fileURLToPath(import.meta.url);
global.__APP_DIR__ = path.dirname(__filename);
global.__DATA_DIR__ = path.join(__APP_DIR__, "/queue-data");

const port = 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(tokenParser);

// Routes
app.use(express.static('public'));
app.use(authRouter);
app.use("/api/employees", employeesRoutes);
app.use(queueRouter);

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

    startupManager.addHook(loadQueueFromDiskHook);
    startupManager.addHook(removeStaleDataHook);

    const age = config['queue.retain-data-days'];
    const schedule = config['queue.purge-data-schedule'];

    if (cron.validate(schedule) && age && typeof age === 'number' && age >= 1) {
        cron.schedule(schedule, () => removeStaleQueueData(age));
    }

    console.log('Starting server...');

    await startupManager.run(config);

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

await start();