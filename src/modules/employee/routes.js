import express from "express";

import requireRole, { csrfProtection } from "../auth/middleware.js";

import {
    createEmployeeController, deleteEmployeeByIdController,
    getEmployeeByIdController,
    getEmployeePageController,

} from "./controllers.js";

import ROLES from "../auth/roles.js";

const router = express.Router();

router.get(
    '/api/employees',
    requireRole(ROLES.ADMIN),
    getEmployeePageController
)

router.get(
    '/api/employees/:id',
    requireRole(ROLES.ADMIN),
    getEmployeeByIdController
)

router.post(
    '/api/employees',
    csrfProtection,
    requireRole(ROLES.ADMIN),
    createEmployeeController
)

router.delete(
    '/api/employees/:id',
    csrfProtection,
    requireRole(ROLES.ADMIN),
    deleteEmployeeByIdController
)

export default router;