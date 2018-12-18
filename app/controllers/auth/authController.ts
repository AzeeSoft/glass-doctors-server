import { Router, Request, Response } from 'express';
import { ApiResponseType } from '@/controllers/apiController';
import { UserModel, User } from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import serverConfig from '@/tools/serverConfig';
import { ApiTokenPayload } from '../../tools/types/auth/index';
import session from 'express-session';

export const authController = Router();

authController.post('/login', login);
authController.post('/signup', signup);

/**
 * Validates user credentials, and sends back a JWT (JSON Web Token).
 */
function login(req: Request, res: Response) {
    let resData: ApiResponseType;

    const { username, password, storeApiTokenInSession } = req.body;

    if (!username || !password) {
        resData = {
            success: false,
            message: `${!username ? 'Username' : 'Password'} is required!`,
        };

        res.send(resData);
        return;
    }

    UserModel.findOne({ username: username })
        .select('username password role')
        .exec((err, user) => {
            if (err) {
                resData = {
                    success: false,
                    message: `Error retrieving the user`,
                    errorReport: err,
                };

                res.send(resData);
            } else {
                if (!user) {
                    resData = {
                        success: false,
                        message: `Invalid Username`,
                    };

                    res.send(resData);
                } else {
                    bcrypt.compare(password, user.password, (err, same) => {
                        if (err) {
                            resData = {
                                success: false,
                                message: `Error validating password`,
                                errorReport: err,
                            };
                        } else {
                            if (!same) {
                                resData = {
                                    success: false,
                                    message: `Invalid Password`,
                                };
                            } else {
                                const payload: ApiTokenPayload = {
                                    userData: {
                                        username: user.username,
                                        role: user.role,
                                    },
                                };
                                const apiToken = jwt.sign(
                                    payload,
                                    serverConfig.auth.jwt.secret,
                                    serverConfig.auth.jwt.options
                                );

                                resData = {
                                    success: true,
                                    message: `Login Successful`,
                                };

                                if (storeApiTokenInSession) {
                                    if (req.session) {
                                        req.session.apiToken = apiToken;
                                    } else {
                                        resData = {
                                            success: false,
                                            message: `Error storing api token`,
                                        };
                                    }
                                } else {
                                    if (req.session) {
                                        req.session.apiToken = undefined;
                                    }
                                    resData.apiToken = apiToken;
                                }
                            }
                        }

                        res.send(resData);
                    });
                }
            }
        });
}

/**
 * Creates new user
 */
async function signup(req: Request, res: Response) {
    const { username, password, name } = req.body;

    const resData: ApiResponseType = await UserModel.addNewUser({
        username: username,
        password: password,
        name: name,
    } as User);

    res.send(resData);
}
