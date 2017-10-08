import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

/**
 * Adds `implements LogsWithWinston` and the interface implementation to each
 * class found in the given contents.
 *
 * @class DecoratorImplementor
 * @extends InheritsCliDecoratorOptions
 */
export class DecoratorImplementor extends InheritsCliDecoratorOptions {
    /* tslint:disable-next-line:max-line-length */
    /** @type {RegExp} Class declaration regex */
    public static DECLARATION_REGEXP = /(@LogsWithWinston[\s\S]*?)?^((?:export)?\s*?class\s+(?:\w+)(?:\s+extends\s+(?:(?:(?!implements)[\w ,])+))?(?:\s+implements\s+([\w ,]+))?)(\s+\{)?$/gmi;
    /** @type {string} The contents of the file to decorate */
    public contents: string;

    /**
     * Decorates all the classes in the passed-in contents.
     *
     * @param {string}               contents
     * The file contents to decorate
     * @param {ICliDecoratorOptions} options
     * The options to use
     */
    public constructor(contents: string, options: ICliDecoratorOptions) {
        super(options);
        this.contents = this.decorate(contents);
    }

    /**
     * Determine how `winston` is being used in the file.
     *
     * @param  {string} contents
     * File contents to parse
     * @return {string}
     * The string to use as the type `LoggerInstance`
     */
    private determineWinstonUsage(contents: string): string {
        /* tslint:disable-next-line:max-line-length */
        const importRegExp = /^\s*import\s*(?:\{[\s\S]*?(?:LoggerInstance(?:\s+as\s+(\w*))?)[\s\S]*?\}|\* as (\w+))\s*from ['"]winston['"];$/gmi;
        const match: any = importRegExp.exec(contents);
        if (typeof match[2] === "string") {
            this.options.logger.silly(`Matched 'import * as ${match[2]} from "winston";'`);
            return `${match[2]}.LoggerInstance`;
        } else if (typeof match[1] === "string") {
            this.options.logger.silly(`Matched 'import { ...LoggerInstance as ${match[1]}... } from "winston";'`);
            return match[1];
        }
        this.options.logger.silly(`Matched 'import { ...LoggerInstance... } from "winston";'`);
        return "LoggerInstance";
    }

    /**
     * Creates the code containing comments and implementation.
     *
     * @param  {string} loggerInstance
     * The string to use as the type `LoggerInstance`
     * @return {string}
     * Code ready to be inserted
     */
    private generateMembers(loggerInstance: string): string {
        return `
/* Begin LogsWithWinston copypasta */
/* ${this.options.linter}:disable */
logger: ${loggerInstance};
naivePrototypeChain: string[];
whoamiWinston: string;
/* ${this.options.linter}:enable */
/* End LogsWithWinston copypasta */`
            .replace(/\r?\n/g, this.options.eol + this.options.indent)
            + this.options.eol;
    }

    /**
     * Determine how `ILogsWithWinston` is being used in the file.
     *
     * @param  {string} contents
     * File contents to parse
     * @return {string}
     * The string to use as the type `LoggerInstance`
     */
    private determineILogsWithWinstonUsage(contents: string): string {
        /* tslint:disable:max-line-length */
        const importRegExp = /^\s*import\s*(?:\{[\s\S]*?(?:ILogsWithWinston(?:\s+as\s+(\w*))?)[\s\S]*?\}|\* as (\w+))\s*from ['"]@wizardsoftheweb\/logs-with-winston['"];$/gmi;
        const match: any = importRegExp.exec(contents);
        if (typeof match[2] === "string") {
            this.options.logger.silly(`Matched 'import * as ${match[2]} from "@wizardsoftheweb/logs-with-winston";'`);
            return `${match[2]}.ILogsWithWinston`;
        } else if (typeof match[1] === "string") {
            this.options.logger.silly(`Matched 'import { ...ILogsWithWinston as ${match[1]}... } from "@wizardsoftheweb/logs-with-winston";'`);
            return match[1];
        }
        this.options.logger.silly(`Matched 'import { ...ILogsWithWinston... } from "@wizardsoftheweb/logs-with-winston";'`);
        /* tslint:enable:max-line-length */
        return "ILogsWithWinston";
    }

    /**
     * Determine how `LogsWithWinston` is being used in the file.
     *
     * @param  {string} contents
     * File contents to parse
     * @return {string}
     * The string to use as the type `LoggerInstance`
     */
    private determineLogsWithWinstonUsage(contents: string): string {
        /* tslint:disable:max-line-length */
        const importRegExp = /^\s*import\s*(?:\{[\s\S]*?(?:LogsWithWinston(?:\s+as\s+(\w*))?)[\s\S]*?\}|\* as (\w+))\s*from ['"]@wizardsoftheweb\/logs-with-winston['"];$/gmi;
        const match: any = importRegExp.exec(contents);
        if (typeof match[2] === "string") {
            this.options.logger.silly(`Matched 'import * as ${match[2]} from "@wizardsoftheweb/logs-with-winston";'`);
            return `${match[2]}.LogsWithWinston`;
        } else if (typeof match[1] === "string") {
            this.options.logger.silly(`Matched 'import { ...LogsWithWinston as ${match[1]}... } from "@wizardsoftheweb/logs-with-winston";'`);
            return match[1];
        }
        this.options.logger.silly(`Matched 'import { ...LogsWithWinston... } from "@wizardsoftheweb/logs-with-winston";'`);
        /* tslint:enable:max-line-length */
        return "LogsWithWinston";
    }

    /**
     * Appends `(implements )?,? LogsWithWinston` to the class declaration
     *
     * @param  {string[]} match
     * The found class declaration
     * @param {string} logsWithWinstonUsage
     * The found name for `logsWithWinstonUsage`
     * @return {string}
     * The new declaration with `LogsWithWinston`
     */
    private appendImplements(match: string[], iLogsWithWinstonUsage: string): string {
        if (typeof match[3] !== "undefined") {
            if (match[3].indexOf(iLogsWithWinstonUsage) < 0) {
                return match[0].replace(match[3], `${match[3]}, ${iLogsWithWinstonUsage}`);
            } else {
                return match[0];
            }
        }
        return `${match[2]} implements ${iLogsWithWinstonUsage}${match[4]}`;
    }

    /**
     * Decorates every class declaration found by a properly decorated class
     * implementing `LogsWithWinston`.
     *
     * @param  {string} contents
     * The file to modify
     * @return {string}
     * The decorated contents
     */
    private decorate(contents: string): string {
        let output = contents;
        const loggerInstance = this.determineWinstonUsage(contents);
        const logsWithWinston = this.determineLogsWithWinstonUsage(contents);
        const iLogsWithWinston = this.determineILogsWithWinstonUsage(contents);
        const members = this.generateMembers(loggerInstance);
        const sanitizedMembers = members.replace(/\*/g, "\\*");
        let match: any;
        const declarationRegExp = logsWithWinston === "LogsWithWinston"
            ? DecoratorImplementor.DECLARATION_REGEXP
            : new RegExp(
                DecoratorImplementor.DECLARATION_REGEXP
                    .toString()
                    .replace(/^\/([\s\S]*?)\/\w*$/g, "$1")
                    .replace("LogsWithWinston", logsWithWinston),
                "gmi",
            );
        declarationRegExp.lastIndex = 0;
        /* tslint:disable-next-line:no-conditional-assignment */
        while (match = declarationRegExp.exec(contents)) {
            output = output.replace(
                match[0],
                (match[1] || this.options.decorator + this.options.eol)
                + this.appendImplements(match, iLogsWithWinston)
                + members,
            )
                .replace(new RegExp(`${sanitizedMembers}\\s*?${sanitizedMembers}`, "gmi"), members);
        }
        return output;
    }
}
