import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import HTTP_statusCode from '../enums/httpStatusCode'

const secret_key = process.env.jwt_secret as string;
const accessTokenTime = process.env.Access_Token_Expirey_Time as string;
const refreshTokenTime = process.env.Refresh_Token_Expirey_Time as string;

const createToken = (user_id: string, role: string): string => {
    return jwt.sign({ user_id, role }, secret_key, { expiresIn: accessTokenTime });
};

const createRefreshToken = (user_id: string, role: string): string => {
    return jwt.sign({ user_id, role }, secret_key, { expiresIn: refreshTokenTime });
};

export { createToken, createRefreshToken }