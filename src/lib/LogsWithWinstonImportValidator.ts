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
        this.contents = this.findOrCreateLogsWithWinstonImport(contents);
    }

    /**
     * Adds an import after the last found import.
     *
     * @param  {string} contents
     * File contents that need an import
     * @return {string}
     * File contents with import
     */
    private createLogsWithWinstonImport(contents: string): string {
        const allImports = /([\s\S]*^import[\s\S]*?;$)/gmi;
        return contents.replace(
            allImports,
            `$1\
${this.options.eol}\
${this.options.eol}\
import {${this.options.eol}\
${this.options.indent}ILogsWithWinston,${this.options.eol}\
${this.options.indent}LogsWithWinston,${this.options.eol}\
} from "@wizardsoftheweb/logs-with-winston";${this.options.eol}\
${this.options.eol}`,
        )
            // Replace multiple newlines with max two
            .replace(/\r?\n$\s*\r?\n/gmi, this.options.eol + this.options.eol);
    }

    /**
     * Checks the found `LogsWithWinston` import for `ILogsWithWinston` and
     * `LogsWithWinston`.
     *
     * @param  {string} imports
     * A(n unexploded array inside the) string containing all imported
     * `LogsWithWinston` members
     * @return {string}
     * A sorted list of imports now containing necessary imports
     */
    private findOrInsertImports(imports: string): string {
        this.options.logger.silly("Parsing LogsWithWinston imports");
        let foundILogsWithWinston = false;
        let foundLogsWithWinston = false;
        const importedClasses = imports
            .split(",")
            .reduce((accumulator: string[], current: string) => {
                if (/\bILogsWithWinston\b/.test(current)) {
                    this.options.logger.silly("Found ILogsWithWinston import");
                    foundILogsWithWinston = true;
                }
                if (/\bLogsWithWinston\b/.test(current)) {
                    this.options.logger.silly("Found LogsWithWinston import");
                    foundLogsWithWinston = true;
                }
                current = current.trim();
                return current.length > 0 ? [current].concat(accumulator) : accumulator;
            }, []);
        if (!foundILogsWithWinston) {
            this.options.logger.silly("Appending ILogsWithWinston import");
            importedClasses.push("ILogsWithWinston");
        }
        if (!foundLogsWithWinston) {
            this.options.logger.silly("Appending LogsWithWinston import");
            importedClasses.push("LogsWithWinston");
        }
        this.options.logger.silly("Sorting imports");
        importedClasses.sort();
        return `\
${this.options.eol}\
${this.options.indent}${importedClasses.join("," + this.options.eol + this.options.indent)},${this.options.eol}`;
    }

    /**
     * Checks for a `LogsWithWinston` import and adds one if not found.
     *
     * @param  {string} contents
     * File contents to check
     * @return {string}
     * File contents with a `LogsWithWinston` import
     */
    private findOrCreateLogsWithWinstonImport(contents: string): string {
        this.options.logger.silly("Checking for LogsWithWinston import");
        if (contents.match(/^\s*import[\s\S]*?['"]@wizardsoftheweb\/logs-with-winston['"];\s*$/gmi)) {
            this.options.logger.silly("Found LogsWithWinston import");
            /* tslint:disable-next-line:max-line-length */
            const importRegExp = /^\s*import\s*(\{([^\}]+)\}|\* as (\w+))\s*from ['"]@wizardsoftheweb\/logs-with-winston['"];$/gmi;
            const match: any = importRegExp.exec(contents);
            if (typeof match[2] !== "undefined") {
                return contents.replace(match[2], this.findOrInsertImports(match[2]));
            }
            return contents;
        }
        return this.createLogsWithWinstonImport(contents);
    }
}
