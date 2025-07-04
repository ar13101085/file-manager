import express, { Request, Response } from 'express';
import { signInRouter } from "./signin";
import { signUpRouter } from "./signup";
import { logoutRouter } from "./logout";
import { checkRouter } from "./check";
import { meRouter } from "./me";

const router = express.Router();
router.use(signInRouter);
router.use(signUpRouter);
router.use(logoutRouter);
router.use(checkRouter);
router.use(meRouter);

export { router as userRouter };