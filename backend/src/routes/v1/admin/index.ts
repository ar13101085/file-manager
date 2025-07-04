import express from 'express';
import { adminUsersRouter } from './users';

const router = express.Router();

router.use(adminUsersRouter);

export { router as adminRouter };