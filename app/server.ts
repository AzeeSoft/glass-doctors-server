// Registers module alisases (Needed for aliases to work in Node)
import 'module-alias/register';

// Imports and configures all the environment variables from .env file into the process.env object.
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import serverConfig, { ServerMode } from '@/tools/serverConfig';
import { UserModel } from '@/models/user';
import { apiController } from '@/controllers/apiController';
import session from 'express-session';

import connectMongoDbSession from 'connect-mongodb-session';
import devTools from './tools/devTools';
import debugMiddlewares from './middlewares/debugMiddlewares';
const MongoDBStore = connectMongoDbSession(session);

class Server {
    readonly app: express.Application = express();

    private db: mongoose.Connection | null = null;

    public constructor() {}

    public init() {
        console.log('Initializing Server...');

        // Although not needed, adding this if condition just to make it clear
        if (serverConfig.isDev) {
            devTools.log(`Running in Development Mode...\n`);
            devTools.log(`Server Config: ${JSON.stringify(serverConfig, null, 4)}`);
        }

        console.log();

        this.initExpressServer();
        this.initDatabaseConnection();
    }

    private initExpressServer() {
        if (serverConfig.isDev) {
            this.app.use(debugMiddlewares.logRequestStart);

            this.app.use(
                morgan('combined', {
                    immediate: true,
                })
            );
        }

        this.app.use(bodyParser.json());
        this.app.use(
            cors({
                origin: serverConfig.http.cors.origin,
                credentials: true,
            })
        );

        const sessionStore = new MongoDBStore(
            {
                uri: serverConfig.mongo.uri,
                collection: serverConfig.mongo.sessionCollection,
            },
            err => {
                if (err) {
                    console.error('Cannot initialize Session Store:');
                    console.error(JSON.stringify(err, null, 4));
                }
            }
        );

        sessionStore.on('error', err => {
            if (err) {
                console.error('Error in Session Store:');
                console.error(JSON.stringify(err, null, 4));
            }
        });

        this.app.use(
            session({
                secret: serverConfig.auth.session.secret,
                store: sessionStore,
                resave: true,
                saveUninitialized: true,
            })
        );

        this.app.use('/', apiController);

        this.app.listen(serverConfig.http.port, () => {
            console.log(`Listening at http://localhost:${serverConfig.http.port}/`);
        });
    }

    private initDatabaseConnection() {
        console.log('Initializing connection to database...\n');

        mongoose.connect(
            serverConfig.mongo.uri,
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
            console.log('Connected to the database successfully!\n');

            UserModel.addAdminIfMissing();
        });
    }
}

export const server = new Server();
server.init();
