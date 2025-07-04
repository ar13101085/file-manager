import express, { NextFunction, Response, Request } from 'express';
import { DefaultPayloadModel } from '../../../types/default-payload';
import { GeneralError } from '../../../utils/errors';
import { SessionModel } from '../../../models/Session';
import { requireAuth } from '../../../middleware/auth';

const router = express.Router();

router.post("/logout", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new GeneralError("No token provided");
        }

        // Blacklist the token
        const success = await SessionModel.blacklistToken(token);
        
        if (!success) {
            throw new GeneralError("Failed to logout");
        }

        const response: DefaultPayloadModel<null> = {
            isSuccess: true,
            msg: "Successfully logged out",
            data: null
        };

        res.json(response);

    } catch (error) {
        next(error);
    }
});

// Logout from all devices
router.post("/logout-all", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).userId;
        
        // Blacklist all user sessions
        await SessionModel.blacklistAllUserSessions(userId);

        const response: DefaultPayloadModel<null> = {
            isSuccess: true,
            msg: "Successfully logged out from all devices",
            data: null
        };

        res.json(response);

    } catch (error) {
        next(error);
    }
});

export { router as logoutRouter };