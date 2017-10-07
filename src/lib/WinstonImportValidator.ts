import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

export class WinstonImportValidator extends InheritsCliDecoratorOptions {
    public contents: string;

    public constructor(contents: string, options: ICliDecoratorOptions) {
        super(options);
        this.contents = this.checkWinstonImport(contents);
    }

    private createWinstonImport(contents: string): string {
        this.options.logger.verbose("Adding winston import");
        return `\
import { LoggerInstance } from "winston";${this.options.eol}\
${this.options.eol}\
${contents}`;
    }

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
