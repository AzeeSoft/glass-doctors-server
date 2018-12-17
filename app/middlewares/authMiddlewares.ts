import { Request, Response, NextFunction } from 'express';
import { ApiResponseType } from '../controllers/apiController';
import { UserRole } from '../models/user';

const authMiddlewares = {
    allowOnlyWithToken(req: Request, res: Response, next: NextFunction) {
        if (req.apiTokenPayload) {
            next();
        } else {
            const resData: ApiResponseType = {
                success: false,
                message: 'Authorization error. Token Required.',
            };

            res.send(resData);
        }
    },
    allowOnlyAdmin(req: Request, res: Response, next: NextFunction) {
        if (req.apiTokenPayload && req.apiTokenPayload.userData.role === UserRole.ADMIN) {
            next();
        } else {
            const resData: ApiResponseType = {
                success: false,
                message: 'Authorization error. Insufficient permissions.',
            };

            res.send(resData);
        }
    },
};

export default authMiddlewares;
