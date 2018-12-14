import { server } from '../server';
import { UserModel, UserRole, User } from '../models/user';
import { Router } from 'express';
import { usersController } from './users/usersController';

export type ApiResponse = {
  success: boolean,
  message: string,
  error?: object,
} & {[key: string]: any}

export const apiController: Router = Router();

apiController.use('/users', usersController);