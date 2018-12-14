import express, { Router } from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import serverConfig from './tools/serverConfig';
import { UserModel, User, UserRole } from './models/user';
import { apiController } from './controllers/apiController';

class Server {
    readonly app: express.Application = express();

    private db: mongoose.Connection | null = null;

    public constructor() {}

    public init() {
        console.log('Initializing Server...');

        this.initExpressServer();
        this.initDatabaseConnection();
    }

    private initExpressServer() {
        this.app.use(morgan('combined'));
        this.app.use(bodyParser.json());
        this.app.use(cors());

        this.app.use('/', apiController);

        this.app.listen(serverConfig.http.port, () => {
            console.log(`Listening at http://localhost:${serverConfig.http.port}/`);
        });
    }

    private initDatabaseConnection() {
        mongoose.connect(
            `mongodb://${serverConfig.mongo.host}:${serverConfig.mongo.port}/${
                serverConfig.mongo.db
            }`,
            {
                useNewUrlParser: true,
            },
            err => {
                if (err) {
                    console.error('Error: Cannot connect to the database...');
                    console.error(err.stack);
                }
            }
        );

        this.db = mongoose.connection;
        this.db.once('open', callback => {
            console.log('Connected to the database successfully!');

            this.addAdminUserIfMissing();
        });
    }

    private addAdminUserIfMissing() {
        UserModel.findOne({ role: UserRole.ADMIN }, (err, user) => {
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

export const server = new Server();
server.init();
