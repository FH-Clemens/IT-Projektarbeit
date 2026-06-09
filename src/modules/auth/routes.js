import express from 'express';
import { loginController, logoutController } from "./controllers.js";

const authRouter = express.Router();

authRouter.post("/api/auth", loginController);
authRouter.post("/api/auth/logout", logoutController);

export default authRouter;