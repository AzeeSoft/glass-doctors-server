import mongoose from 'mongoose';
import { Typegoose, prop, staticMethod, ModelType } from 'typegoose';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export const ReservedUsernames = ['admin'];

export class User extends Typegoose {
    @prop({ required: true, unique: true })
    username: string = '';

    @prop({ required: true })
    name: string = '';

    @prop({ required: true, enum: UserRole })
    role: UserRole = UserRole.USER;

    @staticMethod
    static addAdminIfMissing(this: ModelType<User> & User) {
        this.findOne({ role: UserRole.ADMIN }, (err, user) => {
            if (err) {
                console.log('Error retrieving admin user!');
            } else {
                if (!user) {
                    console.log('Admin user is missing...');
                    console.log('Creating Admin User...');

                    const adminUserModel = new UserModel({
                        username: 'admin',
                        name: 'Admin',
                        role: UserRole.ADMIN,
                    } as User);

                    adminUserModel.save(err => {
                        if (err) {
                            console.log('Error creating admin user!');
                        } else {
                            console.log('Admin user created successfully!');
                        }
                    });
                }
            }
        });
    }
}

export const UserModel = new User().getModelForClass(User);
