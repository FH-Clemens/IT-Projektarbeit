import express from 'express';

import { addToQueue, getQueue } from './src/queue.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url);
export const APP_DIR = path.dirname(__filename);

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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})