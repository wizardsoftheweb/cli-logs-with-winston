import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

/**
 * Ensures `LogsWithWinston` is imported and usable.
 * @class LogsWithWinstonImportValidator
 * @extends InheritsCliDecoratorOptions
 */
export class LogsWithWinstonImportValidator extends InheritsCliDecoratorOptions {
    /** @type {string} The contents of the class file to validate */
    public contents: string;

    /**
     * Checks the given file for `LogsWithWinston` and imports if not found.
     *
     * @param {string}               contents
     * Path to the class to validate
     * @param {ICliDecoratorOptions} options
     * The options to use
     */
    public constructor(contents: string, options: ICliDecoratorOptions) {
        super(options);
        this.contents = this.findOrImportLogsWithWinston(contents);
    }

    /**
     * Adds an import after the last found import.
     *
     * @param  {string} contents
     * File contents that need an import
     * @return {string}
     * File contents with import
     */
    private prependLogsWithWinstonImport(contents: string): string {
        const allImports = /([\s\S]*^import[\s\S]*?$)/gmi;
        return contents.replace(
            allImports,
            `$1\
${this.options.eol}\
${this.options.eol}\
import { LogsWithWinston } from "@wizardsoftheweb/logs-with-winston";${this.options.eol}\
${this.options.eol}`,
        )
            // Replace multiple newlines with max two
            .replace(/\r?\n$\s*\r?\n/gmi, this.options.eol + this.options.eol);
    }

    /**
     * Checks for a `LogsWithWinston` import and adds one if not found.
     *
     * @param  {string} contents
     * File contents to check
     * @return {string}
     * File contents with a `LogsWithWinston` import
     */
    private findOrImportLogsWithWinston(contents: string): string {
        const importLogsWithWinstonRegExp = /^\s*import[\s\S]*?(LogsWithWinston|logs-with-winston)[\s\S]*?;$/gmi;
        if (importLogsWithWinstonRegExp.test(contents)) {
            return contents;
        }
        return this.prependLogsWithWinstonImport(contents);
    }
}
