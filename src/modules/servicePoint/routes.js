import express from "express";

import ROLES from "../auth/roles.js";
import requireRole, { csrfProtection } from "../auth/middleware.js";

import {
    createServicePointController,
    getAllServicePointsController,
    getServicePointByIdController,
    updateServicePointByIdController,
    deleteServicePointByIdController
} from "./controller.js";

const router = express.Router();

router.get(
    '/api/service-point/get-all',
    csrfProtection,
    requireRole(ROLES.ADMIN, ROLES.CLERK),
    getAllServicePointsController
)

router.get(
    '/api/service-point/:id',
    csrfProtection,
    requireRole(ROLES.ADMIN, ROLES.CLERK),
    getServicePointByIdController
)

router.put(
    '/api/service-point/:id',
    csrfProtection,
    requireRole(ROLES.ADMIN, ROLES.CLERK),
    updateServicePointByIdController
)

router.post(
    '/api/service-point/create',
    csrfProtection,
    requireRole(ROLES.ADMIN, ROLES.CLERK),
    createServicePointController
);

router.delete(
    '/api/service-point/delete',
    csrfProtection,
    requireRole(ROLES.ADMIN, ROLES.CLERK),
    deleteServicePointByIdController
)

export default router;