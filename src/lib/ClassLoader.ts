import {
    readFileSync,
    writeFileSync,
} from "fs";
import { basename } from "path";

import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

/**
 * Attempts to load a given class file. If the file is not file, creates the
 * class and writes its file to disk.
 *
 * @class ClassLoader
 * @extends InheritsCliDecoratorOptions
 */
export class ClassLoader extends InheritsCliDecoratorOptions {
    /** @type {string} The contents of the class file */
    public contents: string;

    /**
     * Loads or creates the given class file and stores its contents.
     *
     * @param {string}               filename
     * Path to the class to load or create
     * @param {ICliDecoratorOptions} options
     * The options to use
     */
    public constructor(filename: string, options: ICliDecoratorOptions) {
        super(options);
        this.contents = this.loadClass(filename);
    }

    /**
     * Creates a class file whose name matches the `basename` of the `filename`.
     *
     * @param  {string} filename
     * The file to create
     * @return {string}
     * The file contents
     * @see `path.basename`
     */
    private createClass(filename: string): string {
        const name = basename(filename, this.options.extension);
        this.options.logger.verbose(`Creating class ${name}`);
        const contents = `\
export class ${name} {${this.options.eol}\
${this.options.indent}// fill out later${this.options.eol}\
}${this.options.eol}`;
        writeFileSync(filename, contents, "utf-8");
        return contents;
    }

    /**
     * Loads or creates the given class file
     *
     * @param {string} filename
     * The file to load or create
     * @return {string}
     * The file contents
     */
    private loadClass(filename: string): string {
        let contents: string;
        try {
            this.options.logger.silly(`Attempting to load ${filename}`);
            contents = readFileSync(filename, "utf-8");
        } catch (error) {
            this.options.logger.silly(`File ${filename} does not exist`);
            contents = this.createClass(filename);
        }
        return contents;
    }
}
