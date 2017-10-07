import {
    isAbsolute,
    join,
    resolve,
} from "path";

import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

/**
 * This class checks `process.argv` for a list of files and resolves their
 * absolute file path.
 *
 * @class FileResolver
 */
export class FileResolver extends InheritsCliDecoratorOptions {
    /** @type {String} Error message for null input */
    public static ERROR_NO_INPUT = "Must specify at least one file";

    /** @type {string[]} An array of resolved absolute file names */
    public files: string[];

    /**
     * Applies passed-in options and validates `process.argv` input
     *
     * @param {ICliDecoratorOptions} options
     * The options to use
     */
    public constructor(options: ICliDecoratorOptions) {
        super(options);
        const files = this.parseArgv();
        this.validateFiles(files);
        this.files = this.resolveFiles(files);
    }

    /**
     * Returns everything from `process.argv` after `node` and the calling
     * script. The assumption is that everything after the script will be either
     * a filename or class name (whose file should be created).
     *
     * @return {string[]}
     * An array of file inputs
     */
    private parseArgv(): string[] {
        return process.argv.slice(2);
    }

    /**
     * Checks for the presence of input files.
     *
     * @param {string[]} files
     * An array of file inputs
     * @throws if no input passed
     */
    private validateFiles(files: string[]): void {
        if (files.length < 1) {
            const error = new Error(FileResolver.ERROR_NO_INPUT);
            this.options.logger.error(error.message);
            throw error;
        }
        this.options.logger.silly(`Detected ${files.length} files`);
    }

    /**
     * Strips extensions from filenames, appends the desired extension,
     * joins with `process.cwd()` for an absolute path, and resolves the result
     * to make a pretty path.
     *
     * @param  {string[]} files
     * An array of file inputs to create absolute paths for
     * @return {string[]}
     * An array of absolute paths to the input
     */
    private resolveFiles(files: string[]): string[] {
        return files.map((filename: string) => {
            this.options.logger.silly(`Given ${filename}`);
            const relativeFilename = filename.replace(/(\.\w+)?$/g, this.options.extension);
            this.options.logger.silly(`Set extension (${relativeFilename})`);
            const absolutePath = isAbsolute(relativeFilename)
                ? relativeFilename
                : join(process.cwd(), relativeFilename);
            this.options.logger.silly(`Found absolute path (${absolutePath})`);
            const resolvedFilename = resolve(absolutePath);
            this.options.logger.verbose(`Resolved ${resolvedFilename}`);
            return resolvedFilename;
        });
    }
}
