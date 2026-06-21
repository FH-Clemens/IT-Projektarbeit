import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

dotenv.config();

import requireRole, {tokenParser} from "./src/modules/auth/middleware.js";
import cookieParser from 'cookie-parser';
import genSecret from "./src/modules/crypto/hooks.js";

import StartupManager from "./src/startup.js";
import { removeStaleDataHook, loadQueueFromDiskHook } from "./src/modules/queue/hooks.js";

import authRouter from './src/modules/auth/routes.js';
import queueRouter from './src/modules/queue/routes.js';
import employeeRouter from './src/modules/employee/routes.js';
import servicePointRouter from './src/modules/servicePoint/routes.js';
import ROLES from "./src/modules/auth/roles.js";
import * as http from "node:http";

import {setSocketServer} from "./src/realtime.js";
import fsasync from "fs/promises";

const __filename = fileURLToPath(import.meta.url);

global.__APP_DIR__ = path.dirname(__filename);
global.__DATA_DIR__ = path.join(__APP_DIR__, "data");
global.__DB_PATH__ = path.join(__APP_DIR__, "database.db");
global.__QUEUE_DATA_DIR__ = path.join(__DATA_DIR__, "queue-data");

await fsasync.mkdir(__DATA_DIR__, { recursive: true });

const port = 3000;
const app = express();

//websocket
const httpServer = http.createServer(app);
const io = new Server(httpServer);
setSocketServer(io);

// Middleware
app.use(express.json());
app.use(cookieParser())
app.use(tokenParser());

// Routes
app.use(express.static('pages/public'));
app.use("/internal/admin", requireRole(ROLES.ADMIN), express.static('pages/admin'));
app.use("/internal", requireRole(ROLES.ADMIN, ROLES.CLERK), express.static('pages/protected'));

app.use(authRouter);
app.use(queueRouter);
app.use(employeeRouter);
app.use(servicePointRouter);

StartupManager.addHook(genSecret);
StartupManager.addHook(removeStaleDataHook);
StartupManager.addHook(loadQueueFromDiskHook);

async function start() {

    console.log('Starting server...');

    await StartupManager.run();

    httpServer.listen(port, () => {
        console.log(`App listening on port ${port}`);
    })
}

await start();
