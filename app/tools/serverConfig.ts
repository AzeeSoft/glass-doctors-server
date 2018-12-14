export default {
    http: {
        port: process.env.PORT || 8081,
    },
    mongo: {
        host: 'localhost',
        port: 27017,
        db: 'glassDoctors'
    },
};
