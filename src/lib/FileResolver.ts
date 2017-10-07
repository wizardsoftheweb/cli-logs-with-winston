import {
    basename,
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

    private parseArgv(): string[] {
        return process.argv.slice(2);
    }

    private validateFiles(files: string[]): void {
        if (files.length < 1) {
            const error = new Error(FileResolver.ERROR_NO_INPUT);
            this.options.logger.error(error.message);
            throw error;
        }
        this.options.logger.silly(`Detected ${files.length} files`);
    }

    private resolveFiles(files: string[]): string[] {
        return files.map((filename: string) => {
            this.options.logger.silly(`Given ${filename}`);
            const relativeFilename = filename.replace(/(\.\w+)?$/g, this.options.extension);
            this.options.logger.silly(`Set extension (${relativeFilename})`);
            const joinedPath = join(process.cwd(), relativeFilename);
            this.options.logger.silly(`Joined process.cwd() (${joinedPath})`);
            const resolvedFilename = resolve(joinedPath);
            this.options.logger.verbose(`Resolved ${resolvedFilename}`);
            return resolvedFilename;
        });
    }
}
