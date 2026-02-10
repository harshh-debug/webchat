import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { IUser } from "../model/User.js";

export interface AuthenticatedRequest extends Request {
	user?: IUser | null;
}

export const isAuth = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer")) {
			return res.status(401).json({
				message: "Please Login -No auth header",
			});
		}
		const token = authHeader.split(" ")[1] as string;

		const decodedValue = jwt.verify(
			token,
			process.env.JWT_SECRET as string,
		) as JwtPayload;

		if (!decodedValue || !decodedValue.user) {
			return res.status(401).json({
				message: "Invalid token",
			});
		}
		req.user = decodedValue.user;
		next();
	} catch (error) {
        res.status(401).json({
            message:"Please login - JWT ERROR"
        })
    }
};
