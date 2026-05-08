import express from "express";
import requireRole from "../auth/middleware.js";
import ROLES from "../auth/roles.js";
import { enterQueueController, getQueueController, updateStatusController } from "./controllers.js";

const router = express.Router();

// öffentlich
router.post('/api/queue/enter', enterQueueController);
router.get('/api/queue/get-queue', getQueueController);

// nur Mitarbeiter
router.post(
    '/api/queue/update-status',
    requireRole(ROLES.ADMIN, ROLES.CLERK),
    updateStatusController
);

export default router;