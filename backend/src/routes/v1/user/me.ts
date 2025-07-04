import express, { Request, Response, NextFunction } from 'express';
import { DefaultPayloadModel } from '../../../types/default-payload';
import { requireAuth } from '../../../middleware/auth';
import { UserModel } from '../../../models/User';
import { NotFound } from '../../../utils/errors';

const router = express.Router();

// Get current user info
router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;
        const user = await UserModel.findById(userId);
        
        if (!user) {
            throw new NotFound("User not found");
        }

        const response: DefaultPayloadModel<any> = {
            isSuccess: true,
            msg: "User info retrieved",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                isActive: user.isActive
            }
        };

        res.json(response);
    } catch (error) {
        next(error);
    }
});

export { router as meRouter };