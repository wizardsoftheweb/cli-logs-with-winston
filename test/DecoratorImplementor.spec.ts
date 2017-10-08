/* tslint:disable:no-console */
// Things like ...be.true; or ...be.rejected; dont play nice with TSLint
/* tslint:disable:no-unused-expression */
import * as chai from "chai";
// Needed for describe, it, etc.
import { } from "mocha";
import { EOL } from "os";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";

import { InheritsCliDecoratorOptions } from "../src/lib/InheritsCliDecoratorOptions";

const should = chai.should();
chai.use(sinonChai);

const DecoratorImplementor = proxyquire("../src/lib/DecoratorImplementor", {}).DecoratorImplementor;

describe("DecoratorImplementor", (): void => {
    let decorateStub: sinon.SinonStub;
    let decoratorImplementor: any;

    const dummyContents = "qqq";

    beforeEach((): void => {
        decorateStub = sinon.stub(DecoratorImplementor.prototype as any, "decorate");
        decoratorImplementor = new DecoratorImplementor(dummyContents, {} as any);
    });

    describe("constructor", (): void => {
        it("should load decorate the given file", (): void => {
            decorateStub.should.have.been.calledOnce;
            decorateStub.should.have.been.calledWithExactly(dummyContents);
        });
    });

    describe("determineWinstonUsage", (): void => {
        it("should find '* as winston'", (): void => {
            const loggerInstance = (decoratorImplementor as any).determineWinstonUsage(
                "import * as winston from 'winston';",
            );
            loggerInstance.should.equal("winston.LoggerInstance");
        });

        it("should find '{ LoggerInstance as SomethingElse }'", (): void => {
            const loggerInstance = (decoratorImplementor as any).determineWinstonUsage(
                "import { LoggerInstance as SomethingElse } from 'winston';",
            );
            loggerInstance.should.equal("SomethingElse");
        });

        it("should assume LoggerInstance otherwise", (): void => {
            const loggerInstance = (decoratorImplementor as any).determineWinstonUsage(
                "import { LoggerInstance } from 'winston';",
            );
            loggerInstance.should.equal("LoggerInstance");
        });
    });

    describe("generateMembers", (): void => {
        const defaultMembers = `${EOL}\
    /* Begin LogsWithWinston copypasta */${EOL}\
    /* tslint:disable */${EOL}\
    logger: LoggerInstance;${EOL}\
    naivePrototypeChain: string[];${EOL}\
    whoamiWinston: string;${EOL}\
    /* tslint:enable */${EOL}\
    /* End LogsWithWinston copypasta */${EOL}`;

        it("should properly generate the members", (): void => {
            (decoratorImplementor as any).generateMembers("LoggerInstance")
                .should.equal(defaultMembers);
        });
    });

    describe("determineILogsWithWinstonUsage", (): void => {
        it("should find '* as ILogsWithWinston'", (): void => {
            const iLogsWithWinstonInstance = (decoratorImplementor as any).determineILogsWithWinstonUsage(
                "import * as LogsWithWinston from '@wizardsoftheweb/logs-with-winston';",
            );
            iLogsWithWinstonInstance.should.equal("LogsWithWinston.ILogsWithWinston");
        });

        it("should find '{ ILogsWithWinston as SomethingElse }'", (): void => {
            const iLogsWithWinstonInstance = (decoratorImplementor as any).determineILogsWithWinstonUsage(
                "import { ILogsWithWinston as SomethingElse } from '@wizardsoftheweb/logs-with-winston';",
            );
            iLogsWithWinstonInstance.should.equal("SomethingElse");
        });

        it("should assume ILogsWithWinston otherwise", (): void => {
            const iLogsWithWinstonInstance = (decoratorImplementor as any).determineILogsWithWinstonUsage(
                "import { ILogsWithWinston } from '@wizardsoftheweb/logs-with-winston';",
            );
            iLogsWithWinstonInstance.should.equal("ILogsWithWinston");
        });
    });

    describe("determineLogsWithWinstonUsage", (): void => {
        it("should find '* as LogsWithWinston'", (): void => {
            const logsWithWinstonInstance = (decoratorImplementor as any).determineLogsWithWinstonUsage(
                "import * as LogsWithWinston from '@wizardsoftheweb/logs-with-winston';",
            );
            logsWithWinstonInstance.should.equal("LogsWithWinston.LogsWithWinston");
        });

        it("should find '{ LogsWithWinston as SomethingElse }'", (): void => {
            const logsWithWinstonInstance = (decoratorImplementor as any).determineLogsWithWinstonUsage(
                "import { LogsWithWinston as SomethingElse } from '@wizardsoftheweb/logs-with-winston';",
            );
            logsWithWinstonInstance.should.equal("SomethingElse");
        });

        it("should assume LogsWithWinston otherwise", (): void => {
            const logsWithWinstonInstance = (decoratorImplementor as any).determineLogsWithWinstonUsage(
                "import { LogsWithWinston } from '@wizardsoftheweb/logs-with-winston';",
            );
            logsWithWinstonInstance.should.equal("LogsWithWinston");
        });
    });

    describe("appendImplements", (): void => {
        let regExp: RegExp;
        const logsWithWinstonUsage = "LogsWithWinston";

        beforeEach((): void => {
            regExp = DecoratorImplementor.DECLARATION_REGEXP;
            regExp.lastIndex = 0;
        });

        it("should append LogsWithWinston to implemented classes when not found", (): void => {
            const contents = `export class SomeClass implements SomeInterface {${EOL}`;
            const predictedOutput = "export class SomeClass implements SomeInterface, LogsWithWinston {";
            const match = regExp.exec(contents);
            const output = (decoratorImplementor as any).appendImplements(match, logsWithWinstonUsage);
            output.should.equal(predictedOutput);
        });

        it("should add implements on vanilla classes", (): void => {
            const contents = "export class SomeClass {";
            const predictedOutput = "export class SomeClass implements LogsWithWinston {";
            const match = regExp.exec(contents);
            const output = (decoratorImplementor as any).appendImplements(match, logsWithWinstonUsage);
            output.should.equal(predictedOutput);
        });

        it("should do nothing when class implements LogsWithWinston already", (): void => {
            const contents = "export class SomeClass implements LogsWithWinston {";
            const match = regExp.exec(contents);
            const output = (decoratorImplementor as any).appendImplements(match, logsWithWinstonUsage);
            output.should.equal(contents);
        });
    });

    describe("decorate", (): void => {
        let findOrImportLogsWithWinstonStub: sinon.SinonStub;
        let determineWinstonUsageStub: sinon.SinonStub;
        let generateMembersStub: sinon.SinonStub;
        let appendImplementsStub: sinon.SinonStub;

        const defaultWinstonUsage = "LoggerInstance";
        const defaultLogsWithWinstonUsage = "LogsWithWinston";
        const defaultMembers = `${EOL}/* ignore */${EOL}members${EOL}/* ignore */${EOL}`;

        beforeEach((): void => {
            decorateStub.restore();
            findOrImportLogsWithWinstonStub = sinon.stub(decoratorImplementor as any, "findOrImportLogsWithWinston");
            findOrImportLogsWithWinstonStub.callsFake((input: string): string => {
                return `import LogsWithWinston;${EOL}${EOL}${input}`;
            });
            determineWinstonUsageStub = sinon.stub(decoratorImplementor as any, "determineWinstonUsage");
            determineWinstonUsageStub.returns(defaultWinstonUsage);
            generateMembersStub = sinon.stub(decoratorImplementor as any, "generateMembers");
            generateMembersStub.returns(defaultMembers);
            appendImplementsStub = sinon.stub(decoratorImplementor as any, "appendImplements");
        });

        it("should decorate vanilla classes", (): void => {
            const contents = `\
import { LogsWithWinston } from "@wizardsoftheweb/logs-with-winston";${EOL}\
${EOL}\
export class SomeClass {`;
            const predictedOutput = `\
import { LogsWithWinston } from "@wizardsoftheweb/logs-with-winston";${EOL}\
${EOL}\
@LogsWithWinston()${EOL}\
export class SomeClass implements LogsWithWinston {${EOL}\
/* ignore */${EOL}\
members${EOL}\
/* ignore */${EOL}`;
            appendImplementsStub.returns(`export class SomeClass implements ${defaultLogsWithWinstonUsage} {`);
            const output = (decoratorImplementor as any).decorate(contents);
            output.should.equal(predictedOutput);
        });

        it("should redecorate decorated classes", (): void => {
            const predictedOutput = `\
import { LogsWithWinston } from "@wizardsoftheweb/logs-with-winston";${EOL}\
${EOL}\
@LogsWithWinston()${EOL}\
export class SomeClass implements LogsWithWinston {${EOL}\
/* ignore */${EOL}\
members${EOL}\
/* ignore */${EOL}`;
            findOrImportLogsWithWinstonStub.callsFake((input: string): string => {
                return input;
            });
            appendImplementsStub.returns(`export class SomeClass implements ${defaultLogsWithWinstonUsage} {`);
            const output = (decoratorImplementor as any).decorate(predictedOutput);
            output.should.equal(predictedOutput);
        });

    });

    afterEach((): void => {
        decorateStub.restore();
    });
});
