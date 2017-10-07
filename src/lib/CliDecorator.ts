import { writeFileSync } from "fs";

import { ClassLoader } from "./ClassLoader";
import { DecoratorImplementor } from "./DecoratorImplementor";
import { FileResolver } from "./FileResolver";
import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";
import { WinstonImportValidator } from "./WinstonImportValidator";

export class CliDecorator extends InheritsCliDecoratorOptions {
    private files: string[];

    public constructor(args: any = {}) {
        super(args);
        this.files = (new FileResolver(this.options)).files;
    }

    public decorate(): void {
        for (const filename of this.files) {
            let contents = (new ClassLoader(filename, this.options)).contents;
            contents = (new WinstonImportValidator(contents, this.options)).contents;
            contents = (new DecoratorImplementor(contents, this.options)).contents;
            writeFileSync(filename, contents, "utf-8");
        }
    }
}
