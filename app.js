import {addToQueue } from './queue.js';
import express from 'express';

const app = express()
const port = 3000

app.get('/queue/register', (req, res) => {

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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
