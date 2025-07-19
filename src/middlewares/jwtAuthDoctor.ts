
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import HTTP_statusCode from '../enums/httpStatusCode';
import { createToken } from '../config/jwt_config';

const secret_key = process.env.jwt_secret as string;

const doctorAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const accessToken = req.cookies?.doctorAccessToken;
    const refreshToken = req.cookies?.doctorRefreshToken;

    if (!accessToken) {
        if (!refreshToken) {
            res.status(HTTP_statusCode.Unauthorized).json({ message: "Access Denied. No token provided." });
            return;
        }

        try {
            const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string; role: string };
            const newAccessToken = createToken(decoded.user_id, decoded.role);

            res.cookie("doctorAccessToken", newAccessToken, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                maxAge: 15 * 60 * 1000,
            });

            (req as any).user = decoded;
            next();
        } catch (error) {
            res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
        }
        return;
    }

    try {
        const decoded = jwt.verify(accessToken, secret_key) as { user_id: string; role: string };
        (req as any).user = decoded;

        if (decoded.role === 'doctor') {
            next();
        } else {
            res.status(HTTP_statusCode.NoAccess).json({ message: "Access denied. Not a doctor." });
        }
    } catch (error: any) {
        if (error.name === 'TokenExpiredError' && refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string; role: string };
                const newAccessToken = createToken(decoded.user_id, decoded.role);

                res.cookie("doctorAccessToken", newAccessToken, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    maxAge: 15 * 60 * 1000,
                });

                (req as any).user = decoded;
                next();
            } catch (refreshErr) {
                res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
            }
        } else {
            res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid access token." });
        }
    }
};

export default doctorAuthMiddleware;
