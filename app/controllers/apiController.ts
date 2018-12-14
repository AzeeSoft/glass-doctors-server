import { server } from '../server';
import { UserModel, UserRole, User } from '../models/user';
import { Router } from 'express';
import { usersController } from './users/usersController';

export const apiController: Router = Router();

apiController.use('/users', usersController);