import express from 'express';
import {login} from "./controller.js";

const authRouter = express.Router();

authRouter.post("/auth", login);

export default authRouter;
