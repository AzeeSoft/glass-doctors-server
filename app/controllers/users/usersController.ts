import { Router } from 'express';
import { UserModel, UserRole, User, ReservedUsernames } from '../../models/user';
import { ApiResponse } from '../apiController';

export const usersController: Router = Router();

/**
 * Method: GET
 * Retrieves a list of users
 */
usersController.get('/', (req, res) => {
    let resData: ApiResponse;

    UserModel.find()
        .select('username name role')
        .sort({ _id: 1 })
        .exec((err, users) => {
            if (err) {
                resData = {
                    success: false,
                    message: `Error retrieving users: ${err.errmsg}`,
                    error: err,
                };

                console.log(resData.message);
            } else {
                resData = {
                    success: true,
                    message: `Retrieved users successfully`,
                    users: users,
                };
            }

            res.send(resData);
        });
});

/**
 * Method: POST
 * Creates a new user
 */
usersController.post('/', (req, res) => {
    let resData: ApiResponse;

    if (ReservedUsernames.indexOf(req.body.username) != -1) {
        resData = {
            success: false,
            message: `Username '${req.body.username}' is reserved. Use a different username.`,
        };

        res.send(resData);
        return;
    }

    const newUserModel = new UserModel({
        username: req.body.username,
        name: req.body.name,
        role: UserRole.USER,
    } as User);

    newUserModel.save(err => {
        if (err) {
            resData = {
                success: false,
                message: `Error creating the user: ${err.errmsg}`,
                error: err,
            };

            console.log(resData.message);
        } else {
            resData = {
                success: true,
                message: 'User created successfully',
            };
        }

        res.send(resData);
    });
});
