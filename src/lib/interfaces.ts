import {LoggerInstance} from "winston";

export interface ICliDecoratorOptions {
    eol: string;
    extension: string;
    indent: string;
    linter: string;
    logger: LoggerInstance;
}
