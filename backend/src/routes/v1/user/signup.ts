import express, { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';
import jwt from "jsonwebtoken";
import { DefaultPayloadModel } from '../../../types/default-payload';
import { GeneralError } from '../../../utils/errors';
import { UserModel } from '../../../models/User';
import { SessionModel } from '../../../models/Session';
import { hasUsers } from '../../../config/database';
import { AuthTokenPayload } from '../../../types/user.types';

const router = express.Router();

router.post("/signup",
    [
        check("username", "Username is required").isLength({ min: 3 }),
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({ min: 6 })
    ], async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new GeneralError("Invalid input. Please check your data.");
            }

            const { username, email, password } = req.body;

            // Check if this is the first user (will be admin)
            const isFirstUser = !(await hasUsers());

            // If not first user, check if request is coming from an admin
            if (!isFirstUser) {
                // This endpoint should only be accessible to create the first admin
                throw new GeneralError("User registration is disabled. Please contact admin.");
            }

            // Check if username already exists
            const existingUserByUsername = await UserModel.findByUsername(username);
            if (existingUserByUsername) {
                throw new GeneralError("Username already exists");
            }

            // Check if email already exists
            const existingUserByEmail = await UserModel.findByEmail(email);
            if (existingUserByEmail) {
                throw new GeneralError("Email already exists");
            }

            // Create new user (first user is always admin)
            const newUser = await UserModel.create({
                username,
                email,
                password,
                role: isFirstUser ? 'admin' : 'user'
            });

            // Create JWT payload
            const payload: AuthTokenPayload = {
                userId: newUser.id,
                username: newUser.username,
                role: newUser.role
            };

            // Generate token
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET_KEY || "",
                { expiresIn: "7d" }
            );

            // Save session
            await SessionModel.create(newUser.id, token);

            // Update last login
            await UserModel.updateLastLogin(newUser.id);

            const response: DefaultPayloadModel<{ token: string; user: any }> = {
                isSuccess: true,
                msg: isFirstUser 
                    ? "Successfully created admin account" 
                    : "Successfully created account",
                data: {
                    token,
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        role: newUser.role,
                        permissions: newUser.permissions
                    }
                }
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    });

export { router as signUpRouter };