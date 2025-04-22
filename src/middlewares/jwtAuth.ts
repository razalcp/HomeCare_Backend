import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import HTTP_statusCode from '../enums/httpStatusCode';
import { createToken, createRefreshToken } from '../config/jwt_config';


const secret_key = process.env.jwt_secret as string;
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // console.log("Cookies received in backend:", req.cookies)

    const accessToken = req.cookies?.UserAccessToken;
    const refreshToken = req.cookies?.UserRefreshToken;
    // console.log("Access Token --->", accessToken);
    // console.log("Refresh Token ---->", refreshToken);



    if (!accessToken) {
        if (!refreshToken) {
            res.status(HTTP_statusCode.Unauthorized).json({ message: "Access Denied. No token provided." });
            return
        }

        try {
            // Verify refresh token and generate new access token
            const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string, role: string };
            const newAccessToken = createToken(decoded.user_id, decoded.role);

            // Set new access token in cookies
            res.cookie("UserAccessToken", newAccessToken, { httpOnly: true, secure: true });

            // Attach user data to request object
            (req as any).user = decoded;
            next();
            return
        } catch (error) {
            res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
            return
        }
    }

    try {
        const decoded = jwt.verify(accessToken, secret_key) as { user_id: string, role: string };
        (req as any).user = decoded; // Attach user data to request object
        // console.log("This is role", (req as any).user.role);

        if ((req as any).user.role === 'user') {
          
            next();
        }
    } catch (error) {
        res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid access token." });
        return
    }
};

export default authMiddleware;