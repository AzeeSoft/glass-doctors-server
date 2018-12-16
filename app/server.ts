import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import serverConfig, { ServerMode } from './tools/serverConfig';
import { UserModel } from './models/user';
import { apiController } from './controllers/apiController';

class Server {
    readonly app: express.Application = express();

    private db: mongoose.Connection | null = null;

    public constructor() {}

    public init() {
        console.log('Initializing Server...');
        if (serverConfig.mode === ServerMode.dev) {
            console.log(`Server Config: ${JSON.stringify(serverConfig, null, 4)}`);
        }
        console.log();

        this.initExpressServer();
        this.initDatabaseConnection();
    }

    private initExpressServer() {
        if (serverConfig.mode === ServerMode.dev) {
            this.app.use(morgan('combined'));
        }

        this.app.use(bodyParser.json());
        this.app.use(cors());

        this.app.use('/', apiController);

        this.app.listen(serverConfig.http.port, () => {
            console.log(`Listening at http://localhost:${serverConfig.http.port}/`);
        });
    }

    private initDatabaseConnection() {
        console.log('Initializing connection to database...\n');

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
        this.db.once('open', () => {
            console.log('Connected to the database successfully!');

            UserModel.addAdminIfMissing();
        });
    }
}

export const server = new Server();
server.init();
