import {
    readFileSync,
    writeFileSync,
} from "fs";
import { basename } from "path";

import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

export class ClassLoader extends InheritsCliDecoratorOptions {
    public contents: string;

    public constructor(filename: string, options: ICliDecoratorOptions) {
        super(options);
        this.contents = this.loadClass(filename);
    }

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

    private loadClass(filename: string) {
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
