import express, { NextFunction, Request, Response } from 'express';
import { requireAuth } from '../../../middleware/auth';
import { searchFilesRecursively } from '../../../utils/file-manager';
import { DefaultPayloadModel } from '../../../types/default-payload';
import { GeneralError } from '../../../utils/errors';

const router = express.Router();

router.get("/search", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q, path = '' } = req.query;
        
        if (!q || typeof q !== 'string') {
            throw new GeneralError("Search query is required");
        }
        
        // Allow single character search for better UX
        if (q.length < 1) {
            throw new GeneralError("Search query must be at least 1 character");
        }
        
        const searchPath = typeof path === 'string' ? path : '';
        const results = await searchFilesRecursively(q, searchPath, 30); // Increased to 30 for display
        
        const response: DefaultPayloadModel<FileInfo[]> = {
            isSuccess: true,
            msg: `Found ${results.length} results`,
            data: results
        };
        
        res.json(response);
    } catch (error) {
        next(error);
    }
});

export { router as searchRouter };