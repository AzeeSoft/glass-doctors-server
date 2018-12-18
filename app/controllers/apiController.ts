import { Router, Request, Response, NextFunction } from 'express';
import { usersController } from './users/usersController';
import { authController } from './auth/authController';
import jwt from 'jsonwebtoken';
import serverConfig from '@/tools/serverConfig';
import { ApiTokenPayload } from '../tools/types/auth/index';
import authMiddlewares from '@/middlewares/authMiddlewares';

export type ApiResponseData = {
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
    req.apiTokenPayload = undefined;

    let apiToken;

    // Try to extract apiToken from the http authorization header
    const authHeader = req.headers.authorization;
    if (authHeader) {
        // The authHeader will be in this format: Bearer <token>
        const authHeaderWords = authHeader.split(' ');
        if (authHeaderWords.length >= 2) {
            apiToken = authHeaderWords[1];

            console.log('Found api token in auth header');
        }
    }

    // Try to extract apiToken from the session
    if (!apiToken) {
        console.log('\nCannot find api token in auth header! Checking session instead...');

        if (req.session && req.session.apiToken) {
            apiToken = req.session.apiToken;
            console.log('Found api token in session');
        } else {
            console.log('Cannot find api token in session!');
        }

        console.log();
    }

    if (apiToken) {
        jwt.verify(
            apiToken,
            serverConfig.auth.jwt.secret,
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
