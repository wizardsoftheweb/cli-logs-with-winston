import { InheritsCliDecoratorOptions } from "./InheritsCliDecoratorOptions";
import { ICliDecoratorOptions } from "./interfaces";

export class DecoratorImplementor extends InheritsCliDecoratorOptions {
    /* tslint:disable-next-line:max-line-length */
    public static DECLARATION_REGEXP = /^((?:export)?\s*class\s+(?:\w+)(?:\s+extends\s+(?:[\w ,]))?(?:\s+implements\s+([\w ,]))?)(\s+\{)?$/gi;
    public contents: string;

    public constructor(contents: string, options: ICliDecoratorOptions) {
        super(options);
        this.contents = this.decorate(contents);
    }

    private determineWinstonUsage(contents: string): string {
        /* tslint:disable-next-line:max-line-length */
        const importRegExp = /^\s*import\s*(?:\{[\s\S]*?(?:LoggerInstance(?:\s+as\s+(\w*))?)[\s\S]*?\}|\* as (\w+))\s*from "winston";$/gmi;
        const match: any = importRegExp.exec(contents);
        if (typeof match[2] === "string") {
            return `${match[2]}.LoggerInstance`;
        } else if (typeof match[1] === "string") {
            return match[1];
        }
        return "LoggerInstance";
    }

    private generateMembers(loggerInstance: string): string {
        return `
/* Begin LogsWithWinston copypasta */
/* ${this.options.linter}:disable */
logger: ${loggerInstance};
naivePrototypeChain: string[];
whoamiWinston: string;
/* ${this.options.linter}:enable */
/* End LogsWithWinston copypasta */`
            .replace(/\r?\n/g, this.options.eol + this.options.indent)
            + this.options.eol;
    }

    private appendImplements(match: string[]): string {
        if (typeof match[2] !== "undefined") {
            return match[0].replace(match[2], `${match[2]}, LogsWithWinston`);
        }
        return `${match[1]} implements LogsWithWinston ${match[3]}`;
    }

    private decorate(contents: string): string {
        let output = contents;
        const loggerInstance = this.determineWinstonUsage(contents);
        let match: any;
        /* tslint:disable-next-line:no-conditional-assignment */
        while (match = DecoratorImplementor.DECLARATION_REGEXP.exec(contents)) {
            output = output.replace(
                match[0],
                this.appendImplements(match) + this.generateMembers(loggerInstance),
            );
        }
        return contents;
    }
}
