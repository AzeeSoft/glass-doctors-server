import { Router, Request, Response, NextFunction } from 'express';
import { usersController } from './users/usersController';
import { authController } from './auth/authController';
import jwt from 'jsonwebtoken';
import serverConfig from '@/tools/serverConfig';
import { ApiTokenPayload } from '../tools/types/auth/index';
import authMiddlewares from '@/middlewares/authMiddlewares';

export type ApiResponseType = {
    success: boolean;
    message: string;
    errorReport?: object;
} & { [key: string]: any };

export const apiController: Router = Router();

apiController.use(extractApiToken);

apiController.use('/auth', authController);
apiController.use('/users', authMiddlewares.allowOnlyWithToken, usersController);


/**
 * Extracts ApiToken from Authorization Header and puts the ApiTokenPayload on the request for further handlers to use.
 */
function extractApiToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    req.apiTokenPayload = undefined;

    if (authHeader) {
        const apiToken = authHeader.split(' ')[1]; // Caz the authHeader will be in this format: Bearer <token>
        jwt.verify(
            apiToken,
            serverConfig.auth.jwt.secret!,
            serverConfig.auth.jwt.options,
            (err, decodedPayload) => {
                if (err) {
                    console.log(`Error during ApiToken Verification: ${err.stack}`);
                } else {
                    req.apiTokenPayload = decodedPayload as ApiTokenPayload;
                }
                next();
            }
        );
    } else {
        next();
    }
}
