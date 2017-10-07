import {LoggerInstance} from "winston";

export interface ICliDecoratorOptions {
    decorator: string;
    eol: string;
    extension: string;
    indent: string;
    linter: string;
    logger: LoggerInstance;
}
