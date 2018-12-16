import { Router } from 'express';
import { usersController } from './users/usersController';

export type ApiResponseType = {
  success: boolean,
  message: string,
  errorReport?: object,
} & {[key: string]: any}

export const apiController: Router = Router();

apiController.use('/users', usersController);