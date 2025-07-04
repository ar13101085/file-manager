import express, { Request, Response, NextFunction } from 'express';
import { DefaultPayloadModel } from '../../../types/default-payload';
import { hasUsers } from '../../../config/database';

const router = express.Router();

// Check if any users exist (public endpoint)
router.get("/check-setup", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hasExistingUsers = await hasUsers();
        
        const response: DefaultPayloadModel<{ hasUsers: boolean }> = {
            isSuccess: true,
            msg: "Setup check completed",
            data: {
                hasUsers: hasExistingUsers
            }
        };

        res.json(response);
    } catch (error) {
        next(error);
    }
});

export { router as checkRouter };