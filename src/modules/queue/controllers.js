import * as service from './services.js';

export function enterQueueController(req, res) {
    const entry = service.enterQueue();
    res.status(201).send(entry);
}

export function getQueueController(req, res) {
    const queue = service.getQueue();
    res.json({queue});
}

export function updateStatusController(req, res) {
    const { queueNumber, status, servicePoint } = req.body;

    if (!queueNumber || !status) {
        return res.status(400).json({error: 'Invalid request'});
    }

    const updated = service.updateQueueStatus(queueNumber, status, servicePoint);

    if(!updated) {
        return res.status(404).json({error: 'Queue entry not found'});
    }

    res.status(204).end();
}