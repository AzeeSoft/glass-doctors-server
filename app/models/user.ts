import mongoose from 'mongoose';
import { Typegoose, prop } from 'typegoose';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export class User extends Typegoose {
    @prop({ required: true, unique: true })
    username: string = '';

    @prop({ required: true })
    name: string = '';

    @prop({ required: true, enum: UserRole })
    role: UserRole = UserRole.USER;
}

export const UserModel = new User().getModelForClass(User);
