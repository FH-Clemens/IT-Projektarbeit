
import { createEmployee, getEmployeePage, getEmployeeById, deleteEmployeeById } from "./services.js";
import { sendResult } from "../../utils.js";

export async function createEmployeeController(req, res) {

    const body = req.body;

    createEmployee(body['name'], body['email'], body['password'], body['role'])
        .then(result => sendResult(result, res, 201));
}

export async function getEmployeePageController(req, res) {

    const size = parseInt(req.query['size']);
    const offset = parseInt(req.query['offset']);

    getEmployeePage(size, offset)
        .then(resultPage => sendResult(resultPage, res, 200));
}

export async function getEmployeeByIdController(req, res) {

    const id = parseInt(req.params['id']);

    getEmployeeById(id)
        .then(result => sendResult(result, res, 200));
}

export async function deleteEmployeeByIdController(req, res) {

    const id = parseInt(req.params['id']);

    deleteEmployeeById(id)
        .then(result => sendResult(result, res, 200));
}