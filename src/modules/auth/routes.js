import express from 'express';
import {loginController} from "./controllers.js";

const authRouter = express.Router();

authRouter.post("/api/auth", loginController);

export default authRouter;
