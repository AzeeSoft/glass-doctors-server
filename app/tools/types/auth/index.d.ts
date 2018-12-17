declare module 'express' {
    interface Request {
        apiTokenPayload?: ApiTokenPayload;
    }
}

export type ApiTokenPayload = {
    userData: {
        username: string;
        role: string;
    }
};