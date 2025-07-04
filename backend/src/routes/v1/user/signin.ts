import express, { NextFunction, Response, Request } from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DefaultPayloadModel } from 'src/types/default-payload';
import { GeneralError, NotFound } from '../../../utils/errors';
import { users } from './signup';

const router = express.Router();

router.post("/signin", async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { userName, password }: { userName: string, password: string } = req.body;
        
        // Find user
        const user = users.get(userName);
        
        if (!user) {
            throw new NotFound("No user found.")
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new GeneralError("Email or password is invalid");
        }

        const payload: any = {
            userId: user.id
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY || "",
            { expiresIn: "7d" },
            (err, token) => {
                if (err) throw err;

                let response: DefaultPayloadModel<any> = {
                    isSuccess: true,
                    msg: "Successfully generate token",
                    data: token
                }
                res.json(response);
            }
        );

    } catch (error) {
        next(error);
    }
});

export { router as signInRouter };