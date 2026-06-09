import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

dotenv.config();

import requireRole, {tokenParser} from "./src/modules/auth/middleware.js";
import cookieParser from 'cookie-parser';

import StartupManager from "./src/startup.js";
import { removeStaleDataHook, loadQueueFromDiskHook } from "./src/modules/queue/hooks.js";

import employeesRoutes from "./employeesRoutes.js";
import authRouter from './src/modules/auth/routes.js';
import queueRouter from './src/modules/queue/routes.js';
import servicePointRouter from './src/modules/servicePoint/routes.js';
import ROLES from "./src/modules/auth/roles.js";
import * as http from "node:http";

import {setSocketServer} from "./src/realtime.js";

const __filename = fileURLToPath(import.meta.url);

global.__APP_DIR__ = path.dirname(__filename);
global.__DATA_DIR__ = path.join(__APP_DIR__, "/queue-data");

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
app.use(express.static('public'));
app.use("/internal", requireRole(ROLES.ADMIN, ROLES.CLERK), express.static('protected'));
app.use(authRouter);
app.use("/api/employees", employeesRoutes);
app.use(queueRouter);
app.use(servicePointRouter);

const startupManager = new StartupManager();

startupManager.addHook(loadQueueFromDiskHook);
startupManager.addHook(removeStaleDataHook);

async function start() {

    console.log('Starting server...');

    await startupManager.run();

    httpServer.listen(port, () => {
        console.log(`App listening on port ${port}`);
    })
}

await start();
