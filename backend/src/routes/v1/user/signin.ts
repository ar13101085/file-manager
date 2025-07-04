import express, { NextFunction, Response, Request } from 'express';
import jwt from "jsonwebtoken";
import { DefaultPayloadModel } from '../../../types/default-payload';
import { GeneralError, NotFound } from '../../../utils/errors';
import { UserModel } from '../../../models/User';
import { SessionModel } from '../../../models/Session';
import { AuthTokenPayload } from '../../../types/user.types';

const router = express.Router();

router.post("/signin", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            throw new GeneralError("Username and password are required");
        }

        // Find user by username
        const user = await UserModel.findByUsername(username);
        
        if (!user) {
            throw new NotFound("Invalid username or password");
        }

        // Check if user is active
        if (!user.isActive) {
            throw new GeneralError("Account is disabled. Please contact admin.");
        }

        // Verify password
        const isMatch = await UserModel.verifyPassword(user, password);

        if (!isMatch) {
            throw new GeneralError("Invalid username or password");
        }

        // Create JWT payload
        const payload: AuthTokenPayload = {
            userId: user.id,
            username: user.username,
            role: user.role
        };

        // Generate token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY || "",
            { expiresIn: "7d" }
        );

        // Save session
        await SessionModel.create(user.id, token);

        // Update last login
        await UserModel.updateLastLogin(user.id);

        const response: DefaultPayloadModel<{ token: string; user: any }> = {
            isSuccess: true,
            msg: "Successfully logged in",
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions
                }
            }
        };

        res.json(response);

    } catch (error) {
        next(error);
    }
});

export { router as signInRouter };