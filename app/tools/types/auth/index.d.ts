declare global {
    namespace Express {
        interface Request {
            apiTokenPayload?: ApiTokenPayload;
        }

        interface SessionData {
            apiToken?: string;
        }
    }
}

export type ApiTokenPayload = {
    userData: {
        username: string;
        role: string;
    };
};
