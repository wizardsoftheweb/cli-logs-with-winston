import { EOL } from "os";
import { Logger } from "winston";

import { ICliDecoratorOptions } from "./interfaces";

/**
 * Holds a reference to the global options so `CliDecorator` can split logic out
 * among logical children.
 *
 * @abstract
 * @class InheritsCliDecoratorOptions
 */
export abstract class InheritsCliDecoratorOptions {
    /**
     * Default `EOL` is `os.EOL`
     *
     * @type {string}
     * @see `os.EOL`
     */
    public static DEFAULT_EOL = EOL;
    /** @type {String} Default extension is `.ts` */
    public static DEFAULT_EXTENSION = ".ts";
    /** @type {String} Default indent is four spaces */
    public static DEFAULT_INDENT = "    ";
    /** @type {String} Default linter is `tslint` */
    public static DEFAULT_LINTER = "tslint";
    /**
     * A static reference to whether or not the options have been logged yet
     *
     * @type {Boolean}
     */
    private static notLogged = true;

    /**
     * Keeps a reference to the options. Can be passed to children.
     *
     * @type {ICliDecoratorOptions}
     */
    protected options: ICliDecoratorOptions;

    /**
     * Parses the input and assigns defaults when members are empty.
     *
     * @param {ICliDecoratorOptions | any} args
     * Options to parse
     */
    public constructor(args: ICliDecoratorOptions | any) {
        this.options = {} as any;
        this.options.eol = args.eol || InheritsCliDecoratorOptions.DEFAULT_EOL;
        this.options.extension = args.extension || InheritsCliDecoratorOptions.DEFAULT_EXTENSION;
        this.options.indent = args.indent || InheritsCliDecoratorOptions.DEFAULT_INDENT;
        this.options.linter = args.linter || InheritsCliDecoratorOptions.DEFAULT_LINTER;
        this.options.logger = args.logger || new Logger({});
        if (InheritsCliDecoratorOptions.notLogged) {
            this.options.logger.silly(`Using EOL "${this.options.eol.toString()}"`);
            this.options.logger.silly(`Using extension "${this.options.extension.toString()}"`);
            this.options.logger.silly(`Using indent "${this.options.indent.toString()}"`);
            this.options.logger.silly(`Using linter "${this.options.linter.toString()}"`);
            InheritsCliDecoratorOptions.notLogged = false;
        }
    }
}
