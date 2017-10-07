import { EOL } from "os";
import {
    Logger,
    LoggerInstance,
} from "winston";

import { ICliDecoratorOptions } from "./interfaces";

export abstract class InheritsCliDecoratorOptions {
    public static DEFAULT_EOL = EOL;
    public static DEFAULT_EXTENSION = ".ts";
    public static DEFAULT_INDENT = "    ";
    public static DEFAULT_LINTER = "tslint";
    public static ERROR_NO_INPUT = "Must specify at least one file";

    protected options: ICliDecoratorOptions;

    public constructor(args: ICliDecoratorOptions | any) {
        this.options = {
            eol: args.eol || InheritsCliDecoratorOptions.DEFAULT_EOL,
            extension: args.extension || InheritsCliDecoratorOptions.DEFAULT_EXTENSION,
            indent: args.indent || InheritsCliDecoratorOptions.DEFAULT_INDENT,
            linter: args.linter || InheritsCliDecoratorOptions.DEFAULT_LINTER,
            logger: args.logger || new Logger({}),
        };
        this.options.logger.silly(`Using EOL "${this.options.eol.toString()}"`);
        this.options.logger.silly(`Using extension "${this.options.extension.toString()}"`);
        this.options.logger.silly(`Using indent "${this.options.indent.toString()}"`);
        this.options.logger.silly(`Using linter "${this.options.linter.toString()}"`);
    }
}
