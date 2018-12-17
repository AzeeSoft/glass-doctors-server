import jwt from 'jsonwebtoken';
export enum ServerMode {
    dev = 'dev',
    prod = 'prod',
}

export default {
    mode: process.env.MODE as ServerMode,
    http: {
        port: +process.env.HTTP_PORT!,
    },
    mongo: {
        host: process.env.MONGO_HOST,
        port: +process.env.MONGO_PORT!,
        db: process.env.MONGO_DB,

        defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,
        passwordHash: {
            saltingRounds: 10,
        },
    },
    auth: {
        jwt: {
            secret: process.env.JWT_SECRET,
            options: {
                expiresIn: '1d',
                issuer: 'GlassDoctors',
            } as jwt.SignOptions,
        },
    },
};
