import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import serverConfig from './tools/serverConfig';
import { UserModel, User, UserRole } from './models/user';

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

        this.app.get('/users', (req, res) => {
            UserModel.find({}, 'username name role', (err, users) => {
                if (err) {
                    console.log('Error retrieving users!');
                }

                res.send({
                    success: !err,
                    users: users,
                });
            }).sort({ _id: 1 });
        });

        this.app.post('/users', (req, res) => {
            const newUserModel = new UserModel({
                username: req.body.username,
                name: req.body.name,
                role: UserRole.USER,
            } as User);

            newUserModel.save(err => {
                if (err) {
                    console.log('Error creating the user!');

                    res.send({
                        success: false,
                        message: 'Cannot create the user',
                    });
                } else {
                    res.send({
                        success: true,
                        message: 'User created successfully',
                    });
                }
            });
        });

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
        });
    }
}

const server = new Server();
server.init();

export default server;
