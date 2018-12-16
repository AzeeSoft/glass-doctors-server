import { Typegoose, prop, staticMethod, ModelType, pre } from 'typegoose';
import bcrypt from 'bcrypt';
import { MongooseDocument } from 'mongoose';
import serverConfig from '../tools/serverConfig';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export const ReservedUsernames = ['admin'];

@pre("save", function(next) {
    const user = this as MongooseDocument & User;

    if (user.isModified('password')) {
        // console.log("Hashing password...");

        bcrypt.hash(user.password, serverConfig.mongo.passwordHash.saltingRounds, (err, hash) => {
            if (err) {
                console.log('Error hashing password!');
                next(err);
            } else {
                user.password = hash;
                next();
            }
        });
    } else {
        next();
    }
})
export class User extends Typegoose {
    @prop({ required: true, unique: true })
    username?: string;

    @prop({ required: true })
    password?: string;

    @prop({ required: true })
    name?: string;

    @prop({ required: true, enum: UserRole, default: UserRole.USER })
    role?: UserRole;

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
                        password: serverConfig.mongo.defaultAdminPassword,
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
