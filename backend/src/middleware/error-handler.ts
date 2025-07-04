import { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import { DefaultPayloadModel } from "../types/default-payload";
import { GeneralError } from "../utils/errors";

export const handleErrors: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    //console.log("error", err);
    let errorObj: DefaultPayloadModel<string> = {
        isSuccess: false,
        msg: err.message,
        data: ""
    }
    if (err instanceof GeneralError) {
        res.status(err.getCode()).json(errorObj);
        return;
    }

    res.status(500).json(errorObj);
}


