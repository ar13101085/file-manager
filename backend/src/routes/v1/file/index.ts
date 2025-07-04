import express from 'express';
import { fileHandlerRouter } from './file-router';
import { searchRouter } from './search-router';

const router = express.Router();
router.use(fileHandlerRouter);
router.use(searchRouter);

export { router as fileRoutes };