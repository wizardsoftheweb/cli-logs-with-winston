import { writeFileSync } from "fs";

import { ClassLoader } from "./ClassLoader";
import { DecoratorImplementor } from "./DecoratorImplementor";
import { FileResolver } from "./FileResolver";
import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";
import { LogsWithWinstonImportValidator } from "./LogsWithWinstonImportValidator";
import { WinstonImportValidator } from "./WinstonImportValidator";

/**
 * Parses files from `argv` then loads each, checks for `winston`, and decorates
 * all found classes. Writes changed files to disk.
 *
 * @class CliDecorator
 * @extends InheritsCliDecoratorOptions
 */
export class CliDecorator extends InheritsCliDecoratorOptions {
    private files: string[];

    /**
     * Resolves filenames from `argv`. Any input is parsed as options.
     *
     * @param {any = {}} args
     * Possible options
     */
    public constructor(args: any = {}) {
        super(args);
        this.files = (new FileResolver(this.options)).files;
    }

    /**
     * Decorates each class in each file found in the constructor
     */
    public decorate(): void {
        for (const filename of this.files) {
            let contents = (new ClassLoader(filename, this.options)).contents;
            contents = (new WinstonImportValidator(contents, this.options)).contents;
            contents = (new LogsWithWinstonImportValidator(contents, this.options)).contents;
            contents = (new DecoratorImplementor(contents, this.options)).contents;
            writeFileSync(filename, contents, "utf-8");
        }
    }
}
