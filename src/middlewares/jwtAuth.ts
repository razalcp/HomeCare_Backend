// import jwt from 'jsonwebtoken';
// import { Request, Response, NextFunction } from 'express';
// import HTTP_statusCode from '../enums/httpStatusCode';
// import { createToken, createRefreshToken } from '../config/jwt_config';


// const secret_key = process.env.jwt_secret as string;
// const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     // console.log("Cookies received in backend:", req.cookies)

//     const accessToken = req.cookies?.UserAccessToken;
//     const refreshToken = req.cookies?.UserRefreshToken;
//     // console.log("Access Token --->", accessToken);
//     // console.log("Refresh Token ---->", refreshToken);



//     if (!accessToken) {
//         if (!refreshToken) {
//             res.status(HTTP_statusCode.Unauthorized).json({ message: "Access Denied. No token provided." });
//             return
//         }

//         try {
//             // Verify refresh token and generate new access token
//             const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string, role: string };
//             const newAccessToken = createToken(decoded.user_id, decoded.role);

//             // Set new access token in cookies
//             res.cookie("UserAccessToken", newAccessToken, { httpOnly: true, secure: true });

//             // Attach user data to request object
//             (req as any).user = decoded;
//             next();
//             return
//         } catch (error) {
//             res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
//             return
//         }
//     }



//     try {
//         const decoded = jwt.verify(accessToken, secret_key) as { user_id: string, role: string };
//         (req as any).user = decoded;

//         if ((req as any).user.role === 'user') {
//             return next();
//         }
//     } catch (error) {
//         // Access token is invalid or expired — try refresh token
//         if (!refreshToken) {
//             return res.status(HTTP_statusCode.Unauthorized).json({ message: "Access denied. Invalid access token and no refresh token." });
//         }

//         try {
//             const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string, role: string };
//             const newAccessToken = createToken(decoded.user_id, decoded.role);

//             res.cookie("UserAccessToken", newAccessToken, { httpOnly: true, secure: true });
//             (req as any).user = decoded;

//             return next();
//         } catch (refreshErr) {
//             return res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
//         }
//     }

// };

// export default authMiddleware;

/////////////


import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import HTTP_statusCode from '../enums/httpStatusCode';
import { createToken } from '../config/jwt_config';

const secret_key = process.env.jwt_secret as string;

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const accessToken = req.cookies?.UserAccessToken;
    const refreshToken = req.cookies?.UserRefreshToken;

    if (!accessToken) {
        if (!refreshToken) {
            res.status(HTTP_statusCode.Unauthorized).json({ message: "Access Denied. No token provided." });
            return;
        }

        try {
            const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string, role: string };
            const newAccessToken = createToken(decoded.user_id, decoded.role);

            res.cookie("UserAccessToken", newAccessToken, { httpOnly: true, secure: true });
            (req as any).user = decoded;
            next();
            return;
        } catch (error) {
            res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
            return;
        }
    }

    try {
        const decoded = jwt.verify(accessToken, secret_key) as { user_id: string, role: string };
        (req as any).user = decoded;

        if ((req as any).user.role === 'user') {
            next();
            return;
        } else {
            res.status(HTTP_statusCode.Unauthorized).json({ message: "Access denied. Not a user." });
            return;
        }
    } catch (error) {
        if (!refreshToken) {
            res.status(HTTP_statusCode.Unauthorized).json({ message: "Access denied. Invalid access token and no refresh token." });
            return;
        }

        try {
            const decoded = jwt.verify(refreshToken, secret_key) as { user_id: string, role: string };
            const newAccessToken = createToken(decoded.user_id, decoded.role);

            res.cookie("UserAccessToken", newAccessToken, { httpOnly: true, secure: true });
            (req as any).user = decoded;
            next();
            return;
        } catch (refreshErr) {
            res.status(HTTP_statusCode.NoAccess).json({ message: "Invalid refresh token." });
            return;
        }
    }
};

export default authMiddleware;