import express, { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator/check';
import { DefaultPayloadModel } from '../../../types/default-payload';
import { GeneralError, NotFound } from '../../../utils/errors';
import { UserModel } from '../../../models/User';
import { requireAuth, requireAdmin } from '../../../middleware/auth';
import { UserPermissions } from '../../../types/user.types';

const router = express.Router();

// Get all users (admin only)
router.get("/users", requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserModel.getAllUsers();
        
        // Remove password from response
        const sanitizedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
            lastLogin: user.lastLogin,
            isActive: user.isActive
        }));

        const response: DefaultPayloadModel<any[]> = {
            isSuccess: true,
            msg: "Successfully fetched users",
            data: sanitizedUsers
        };

        res.json(response);
    } catch (error) {
        next(error);
    }
});

// Create new user (admin only)
router.post("/users",
    requireAuth,
    requireAdmin,
    [
        check("username", "Username is required").isLength({ min: 3 }),
        check("email", "Please include a valid email").isEmail(),
        check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
        check("role", "Role must be either 'admin' or 'user'").isIn(['admin', 'user'])
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new GeneralError("Invalid input. Please check your data.");
            }

            const { username, email, password, role, permissions } = req.body;
            const adminId = (req as any).userId;

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

            // Create new user
            const newUser = await UserModel.create({
                username,
                email,
                password,
                role,
                permissions
            }, adminId);

            const response: DefaultPayloadModel<any> = {
                isSuccess: true,
                msg: "Successfully created user",
                data: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    permissions: newUser.permissions
                }
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
);

// Update user (admin only)
router.put("/users/:userId",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;
            const { email, password, role, permissions, isActive } = req.body;

            // Check if user exists
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new NotFound("User not found");
            }

            // Build update object with only provided fields
            const updateData: any = {};
            if (email !== undefined) updateData.email = email;
            if (password !== undefined) updateData.password = password;
            if (role !== undefined) updateData.role = role;
            if (permissions !== undefined) updateData.permissions = permissions;
            if (isActive !== undefined) updateData.isActive = isActive;

            // Update user
            const updatedUser = await UserModel.update(userId, updateData);

            if (!updatedUser) {
                throw new GeneralError("Failed to update user");
            }

            const response: DefaultPayloadModel<any> = {
                isSuccess: true,
                msg: "Successfully updated user",
                data: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    permissions: updatedUser.permissions,
                    isActive: updatedUser.isActive
                }
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
);

// Delete user (admin only)
router.delete("/users/:userId",
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;
            const requestingUserId = (req as any).userId;

            // Prevent self-deletion
            if (userId === requestingUserId) {
                throw new GeneralError("Cannot delete your own account");
            }

            // Check if user exists
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new NotFound("User not found");
            }

            // Delete user
            const success = await UserModel.delete(userId);
            if (!success) {
                throw new GeneralError("Failed to delete user");
            }

            const response: DefaultPayloadModel<null> = {
                isSuccess: true,
                msg: "Successfully deleted user",
                data: null
            };

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
);

// Get user permissions template
router.get("/permissions-template", requireAuth, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const template: UserPermissions = {
            canRead: true,
            canWrite: false,
            canDelete: false,
            canUpload: false,
            canDownload: true,
            canCreateFolder: false,
            canRename: false,
            canMove: false,
            canArchive: false,
            allowedPaths: [],
            deniedPaths: []
        };

        const response: DefaultPayloadModel<UserPermissions> = {
            isSuccess: true,
            msg: "Permissions template",
            data: template
        };

        res.json(response);
    } catch (error) {
        next(error);
    }
});

export { router as adminUsersRouter };