import express from 'express';
import {login} from "./controller.js";

const router = express.Router();

router.get("/", (req, res) => {
    login(req, res);
});

export default router;
