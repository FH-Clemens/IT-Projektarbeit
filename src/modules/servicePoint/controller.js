
import {
    registerServicePoint,
    removeServicePoint,
    getAllServicePoints,
    getServicePoint,
    changeServicePointStatus
} from "./services.js";

/*
* POST { "name": "Kasse 3" }
*
* */
export function createServicePointController(req, res) {
    registerServicePoint(req.body['name']).then(servicePoint => {
        res.status(201).json(servicePoint);
    });
}

export function getAllServicePointsController(req, res) {
    getAllServicePoints().then(items => {
        res.status(200).json(items ?? []);
    })
}

export function getServicePointByIdController(req, res) {
    getServicePoint(req.params.id).then(servicePoint => {
        res.status(200).json(servicePoint);
    })
}

export function updateServicePointByIdController(req, res) {
    changeServicePointStatus(req.params.id, req.body['status'], req.body['ticketNumber']).then(servicePoint => {
        res.status(200).json(servicePoint);
    })
}

export function deleteServicePointByIdController(req, res) {
    removeServicePoint(req.body['id']).then(_ => {
        res.status(204).end();
    })
}