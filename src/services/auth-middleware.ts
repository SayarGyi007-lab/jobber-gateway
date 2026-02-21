import { config } from "@gateway/config";
import { BadRequestError, IAuthPayload, NotAuthorizedError } from "@sayargyi007-lab/jobber-shared";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

class AuthMiddleware{
    public verifyUser(req:Request, _res:Response, next:NextFunction){
        let token = req.session?.jwt

        if(!token){
            throw new NotAuthorizedError('Invalid Token', 'Gateway service verifyUser() method')
        }

        try {
            const payload: IAuthPayload = verify(token, `${config.JWT_TOKEN}`) as IAuthPayload
            req.currentUser = payload
        } catch (error) {
            throw new NotAuthorizedError('Invalid Token', 'Gateway service verifyUser() method')           
        }
        next()
    }

    public checkAuthentication(req:Request, _res:Response, next:NextFunction){
        if(!req.currentUser){
            throw new BadRequestError('Authentication is required','Gateway service checkAuthetication() method')
        }
        next()
    }
    
}

export const authMiddleware:AuthMiddleware = new AuthMiddleware()