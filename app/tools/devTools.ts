import serverConfig from './serverConfig';

export default {
    log(message?: any, ...optionalParams: any[]) {
        if (serverConfig.isDev) {
            if (message) {
                console.log(message, ...optionalParams);
            } else {
                console.log();
            }
        }
    },
};
