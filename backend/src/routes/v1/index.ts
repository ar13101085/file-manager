import express from 'express';
import { fileRoutes } from './file';
import { userRouter } from "./user";
import { adminRouter } from "./admin";

const router = express.Router();

router.use("/auth", userRouter);
router.use("/file", fileRoutes);
router.use("/admin", adminRouter);

export { router as routes };