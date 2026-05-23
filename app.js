import express from 'express';
import path from 'path';

import { fileURLToPath } from 'url';

import requireRole, {tokenParser} from "./src/modules/auth/middleware.js";

import StartupManager from "./src/startup.js";
import { removeStaleDataHook, loadQueueFromDiskHook } from "./src/modules/queue/hooks.js";

import authRouter from './src/modules/auth/routes.js';
import queueRouter from './src/modules/queue/routes.js';
import Roles from "./src/modules/auth/roles.js";

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
app.use('/internal', requireRole(Roles.ADMIN, Roles.CLERK), express.static('protected'));

app.use(authRouter);
app.use(queueRouter);

const startupManager = new StartupManager();

startupManager.addHook(loadQueueFromDiskHook);
startupManager.addHook(removeStaleDataHook);

async function start() {

    console.log('Starting server...');

    await startupManager.run();

    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })
}

await start();