import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import HTTP_statusCode from '../enums/httpStatusCode';
import { createToken} from '../config/jwt_config';


const secret_key = process.env.jwt_secret as string;
const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // console.log("Cookies received in backend:", req.cookies)

    const accessToken = req.cookies?.adminAccessToken;
    const refreshToken = req.cookies?.adminRefreshToken;

    // console.log("Admin Access Token --->", accessToken);
    // console.log("Admin  Refresh Token ---->", refreshToken);

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
            res.cookie("adminAccessToken", newAccessToken, {
                httpOnly: true, secure: true, sameSite: 'none',
                maxAge: 15 * 60 * 1000,
            });

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
        (req as any).user = decoded;

        if ((req as any).user.role === 'admin') {
            next();
            return;
        } else {
            res.status(HTTP_statusCode.Unauthorized).json({ message: "Access denied. Not an admin." });
            return;
        }
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            if (!refreshToken) {
                res.status(HTTP_statusCode.Unauthorized).json({ message: "Access denied. Access token expired and no refresh token." });
                return;
            }

            try {
                const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string, role: string };
                const newAccessToken = createToken(decoded.user_id, decoded.role);
                res.cookie("adminAccessToken", newAccessToken, {
                    httpOnly: true, secure: true, sameSite: 'none',
                    maxAge: 15 * 60 * 1000,
                });
                (req as any).user = decoded;
                next();
                return;
            } catch (refreshErr) {
                res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
                return;
            }
        } else {
            res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid access token." });
            return;
        }
    }
};

export default adminAuthMiddleware;