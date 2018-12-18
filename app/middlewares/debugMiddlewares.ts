import { Request, Response, NextFunction } from "express";
import devTools from "@/tools/devTools";

export default {
    logRequestStart(req: Request, res: Response, next: NextFunction) {
        devTools.log();
        devTools.log('+--------------------------+');
        devTools.log('|   New Incoming Request   |');
        devTools.log('+--------------------------+');
        devTools.log();

        next();
    },
};
