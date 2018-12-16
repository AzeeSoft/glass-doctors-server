import { Router, RequestHandler, Request, Response } from 'express';
import { UserModel, UserRole, User, ReservedUsernames } from '../../models/user';
import { ApiResponseType } from '../apiController';

export const usersController: Router = Router();

usersController
    .route('/')
    .get(getAllUsers)
    .post(addNewUser);

/**
 * Method: GET
 * Retrieves a list of users
 */
function getAllUsers(req: Request, res: Response) {
    let resData: ApiResponseType;

    UserModel.find()
        .select('username name role')
        .sort({ _id: 1 })
        .exec((err, users) => {
            if (err) {
                resData = {
                    success: false,
                    message: `Error retrieving users`,
                    errorReport: err,
                };

                console.log(`${resData.message}: ${err.message}`);
            } else {
                resData = {
                    success: true,
                    message: `Retrieved users successfully`,
                    users: users,
                };
            }

            res.send(resData);
        });
}

/**
 * Method: POST
 * Creates a new user
 */
function addNewUser(req: Request, res: Response) {
    let resData: ApiResponseType;

    const { username, password, name } = req.body;

    if (ReservedUsernames.indexOf(username) != -1) {
        resData = {
            success: false,
            message: `Username '${username}' is reserved. Use a different username.`,
        };

        res.send(resData);
        return;
    }

    const newUserModel = new UserModel({
        username: username,
        password: password,
        name: name,
    } as User);

    newUserModel.save(err => {
        if (err) {
            resData = {
                success: false,
                message: `Error creating the user!`,
                errorReport: err,
            };

            console.log(`${resData.message}: ${err.message}`);
        } else {
            resData = {
                success: true,
                message: 'User created successfully',
            };
        }

        res.send(resData);
    });
}
