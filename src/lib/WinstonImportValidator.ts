import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

/**
 * Ensures winston is imported and usable.
 * @class WinstonImportValidator
 * @extends InheritsCliDecoratorOptions
 */
export class WinstonImportValidator extends InheritsCliDecoratorOptions {
    /** @type {string} The contents of the class file to validate */
    public contents: string;

    /**
     * Checks the given file for `winston` and imports if not found.
     *
     * @param {string}               contents
     * Path to the class to validate
     * @param {ICliDecoratorOptions} options
     * The options to use
     */
    public constructor(contents: string, options: ICliDecoratorOptions) {
        super(options);
        this.contents = this.checkWinstonImport(contents);
    }

    /**
     * Prepends a `winston` import at the top of the file.
     *
     * @param  {string} contents
     * File to prepend
     * @return {string}
     * Contents with prepended `winston` import
     */
    private createWinstonImport(contents: string): string {
        this.options.logger.verbose("Adding winston import");
        return `\
import { LoggerInstance } from "winston";${this.options.eol}\
${this.options.eol}\
${contents}`;
    }

    /**
     * Checks the found `winston` import for `LoggerInstance`.
     *
     * @param  {string} imports
     * A(n unexploded array inside the) string containing all imported `winston`
     * members
     * @return {string}
     * A sorted list of imports now containing `LoggerInstance`
     */
    private findOrInsertLoggerInstanceImport(imports: string): string {
        this.options.logger.silly("Parsing winston imports");
        let foundLoggerInstance = false;
        const importedClasses = imports
            .split(",")
            .map((current: string) => {
                if (/LoggerInstance/.test(current)) {
                    this.options.logger.silly("Found LoggerInstance import");
                    foundLoggerInstance = true;
                }
                return current.trim();
            });
        if (!foundLoggerInstance) {
            this.options.logger.silly("Appending LoggerInstance import");
            importedClasses.push("LoggerInstance");
        }
        this.options.logger.silly("Sorting imports");
        importedClasses.sort();
        return `\
${this.options.eol}\
${this.options.indent}${importedClasses.join("," + this.options.eol + this.options.indent)},${this.options.eol}`;
    }

    /**
     * Searches contents for a `winston` and `LoggerInstance` import, creating
     * what it cannot find.
     *
     * @param  {string} contents
     * Contents to check
     * @return {string}
     * Contents with the proper imports
     */
    private checkWinstonImport(contents: string): string {
        this.options.logger.silly("Checking for winston import");
        if (contents.match(/^\s*import[\s\S]*?['"]winston['"];\s*$/gyi)) {
            this.options.logger.silly("Found winston import");
            const importRegExp = /^\s*import\s*(\{([^\}]+)\}|\* as (\w+))\s*from "winston";$/gmi;
            const match: any = importRegExp.exec(contents);
            if (typeof match[2] !== "undefined") {
                return contents.replace(match[2], this.findOrInsertLoggerInstanceImport(match[2]));
            }
            return contents;
        }
        return this.createWinstonImport(contents);
    }
}
